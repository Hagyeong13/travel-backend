import { executeQuery, fetchAll, fetchOne } from '../../../common/repositories/base.repository.js';

const toDbBoolean = (value) => {
  if (value === null || value === undefined) return null;
  return value ? 1 : 0;
};

export async function createPlace({
  id,
  roomId,
  addedByMemberId,
  title,
  sourceType,
  sourceUrl,
  address,
  estimatedCost,
  memo,
  isRequired = false
}) {
  const sql = `
    INSERT INTO places (
      id, room_id, added_by_member_id, title, source_type, source_url,
      address, estimated_cost, memo, created_at, updated_at, is_required
    )
    VALUES (
      :id, :roomId, :addedByMemberId, :title, :sourceType, :sourceUrl,
      :address, :estimatedCost, :memo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :isRequired
    )
  `;

  await executeQuery(
    sql,
    {
      id,
      roomId,
      addedByMemberId,
      title,
      sourceType,
      sourceUrl,
      address,
      estimatedCost,
      memo,
      isRequired: toDbBoolean(isRequired)
    },
    { autoCommit: true }
  );

  return findPlaceById(id);
}

export async function findPlaceById(id) {
  const sql = `
    SELECT
      id,
      room_id,
      added_by_member_id,
      title,
      source_type,
      DBMS_LOB.SUBSTR(source_url, 4000, 1) AS source_url,
      address,
      estimated_cost,
      DBMS_LOB.SUBSTR(memo, 4000, 1) AS memo,
      created_at,
      updated_at,
      is_required
    FROM places
    WHERE id = :id
  `;
  return fetchOne(sql, { id });
}

export async function findPlacesByRoomId(roomId) {
  return fetchAll(`SELECT * FROM places WHERE room_id = :roomId`, { roomId });
}

export async function findPlannerPlacesByRoomId({ roomId, memberId }) {
  const sql = `
    SELECT
      p.id,
      p.room_id,
      p.added_by_member_id,
      p.title,
      DBMS_LOB.SUBSTR(p.source_url, 4000, 1) AS source_url,
      DBMS_LOB.SUBSTR(p.memo, 4000, 1) AS memo,
      p.estimated_cost,
      p.is_required,
      NVL(rs.like_count, 0) AS like_count,
      NVL(rs.dislike_count, 0) AS dislike_count,
      NVL(cs.comment_count, 0) AS comment_count,
      CASE WHEN sch.place_id IS NOT NULL THEN 1 ELSE 0 END AS is_scheduled,
      mr.reaction_type AS my_reaction
    FROM places p
    LEFT JOIN (
      SELECT
        place_id,
        SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS like_count,
        SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislike_count
      FROM place_reactions
      GROUP BY place_id
    ) rs ON rs.place_id = p.id
    LEFT JOIN (
      SELECT
        place_id,
        COUNT(*) AS comment_count
      FROM place_comments
      GROUP BY place_id
    ) cs ON cs.place_id = p.id
    LEFT JOIN (
      SELECT DISTINCT place_id
      FROM itinerary_items
      WHERE place_id IS NOT NULL
    ) sch ON sch.place_id = p.id
    LEFT JOIN place_reactions mr
      ON mr.place_id = p.id
      AND mr.member_id = :memberId
    WHERE p.room_id = :roomId
  `;

  return fetchAll(sql, { roomId, memberId });
}

export async function updatePlaceById({
  id,
  title,
  sourceUrl,
  memo,
  estimatedCost,
  isRequired
}) {
  const setClauses = [];
  const binds = { id };

  if (title !== undefined) {
    setClauses.push('title = :title');
    binds.title = title;
  }
  if (sourceUrl !== undefined) {
    setClauses.push('source_url = :sourceUrl');
    binds.sourceUrl = sourceUrl;
  }
  if (memo !== undefined) {
    setClauses.push('memo = :memo');
    binds.memo = memo;
  }
  if (estimatedCost !== undefined) {
    setClauses.push('estimated_cost = :estimatedCost');
    binds.estimatedCost = estimatedCost;
  }
  if (isRequired !== undefined) {
    setClauses.push('is_required = :isRequired');
    binds.isRequired = toDbBoolean(isRequired);
  }

  if (setClauses.length === 0) return;

  const sql = `
    UPDATE places
    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = :id
  `;

  await executeQuery(sql, binds, { autoCommit: true });
}

export async function updatePlaceRequiredById({ id, isRequired }) {
  const sql = `
    UPDATE places
    SET is_required = :isRequired, updated_at = CURRENT_TIMESTAMP
    WHERE id = :id
  `;
  await executeQuery(sql, { id, isRequired: toDbBoolean(isRequired) }, { autoCommit: true });
}

export async function deletePlaceById(id) {
  await executeQuery(`DELETE FROM places WHERE id = :id`, { id }, { autoCommit: true });
}
