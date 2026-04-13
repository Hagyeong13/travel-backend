import { executeInTransaction, executeQuery, fetchAll } from '../../../common/repositories/base.repository.js';

export async function upsertPlaceReaction({ id, placeId, memberId, reactionType }) {
  const deleteSql = `
    DELETE FROM place_reactions
    WHERE place_id = :placeId AND member_id = :memberId
  `;

  const insertSql = `
    INSERT INTO place_reactions (id, place_id, member_id, reaction_type, created_at)
    VALUES (:id, :placeId, :memberId, :reactionType, CURRENT_TIMESTAMP)
  `;

  await executeInTransaction(async (connection) => {
    await connection.execute(deleteSql, { placeId, memberId });

    if (reactionType === 'NONE') {
      return;
    }

    await connection.execute(insertSql, { id, placeId, memberId, reactionType });
  });
}

export async function findReactionsByPlaceId(placeId) {
  const sql = `SELECT * FROM place_reactions WHERE place_id = :placeId`;
  return fetchAll(sql, { placeId });
}

export async function findReactionByPlaceIdAndMemberId({ placeId, memberId }) {
  const sql = `
    SELECT * FROM place_reactions
    WHERE place_id = :placeId AND member_id = :memberId
  `;
  const rows = await fetchAll(sql, { placeId, memberId });
  return rows[0] ?? null;
}

export async function findReactionSummaryByPlaceId(placeId) {
  const sql = `
    SELECT
      SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS like_count,
      SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislike_count
    FROM place_reactions
    WHERE place_id = :placeId
  `;

  const rows = await fetchAll(sql, { placeId });
  return rows[0] ?? null;
}

export async function findReactionSummariesByRoomId(roomId) {
  const sql = `
    SELECT
      pr.place_id,
      SUM(CASE WHEN pr.reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS like_count,
      SUM(CASE WHEN pr.reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislike_count
    FROM place_reactions pr
    JOIN places p ON p.id = pr.place_id
    WHERE p.room_id = :roomId
    GROUP BY pr.place_id
  `;

  return fetchAll(sql, { roomId });
}

export async function deleteReactionsByPlaceId(placeId) {
  const sql = `DELETE FROM place_reactions WHERE place_id = :placeId`;
  await executeQuery(sql, { placeId }, { autoCommit: true });
}
