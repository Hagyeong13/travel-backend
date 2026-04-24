import { executeQuery, fetchAll } from '../../../common/repositories/base.repository.js';

export async function createPlaceComment({ id, placeId, memberId, content }) {
  const sql = `
    INSERT INTO place_comments (id, place_id, member_id, content, created_at, updated_at)
    VALUES (:id, :placeId, :memberId, :content, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  await executeQuery(sql, { id, placeId, memberId, content }, { autoCommit: true });
}

export async function findCommentsByPlaceId(placeId) {
  const sql = `
    SELECT
      pc.id,
      pc.place_id,
      pc.member_id,
      m.name AS member_name,
      DBMS_LOB.SUBSTR(pc.content, 4000, 1) AS content,
      pc.created_at,
      pc.updated_at
    FROM place_comments pc
    LEFT JOIN members m ON m.id = pc.member_id
    WHERE pc.place_id = :placeId
    ORDER BY pc.created_at ASC
  `;
  return fetchAll(sql, { placeId });
}

export async function countCommentsByPlaceId(placeId) {
  const sql = `
    SELECT COUNT(*) AS comment_count
    FROM place_comments
    WHERE place_id = :placeId
  `;
  const rows = await fetchAll(sql, { placeId });
  return rows[0] ?? null;
}

export async function findCommentCountsByRoomId(roomId) {
  const sql = `
    SELECT
      pc.place_id,
      COUNT(*) AS comment_count
    FROM place_comments pc
    JOIN places p ON p.id = pc.place_id
    WHERE p.room_id = :roomId
    GROUP BY pc.place_id
  `;

  return fetchAll(sql, { roomId });
}

export async function deleteCommentsByPlaceId(placeId) {
  const sql = `DELETE FROM place_comments WHERE place_id = :placeId`;
  await executeQuery(sql, { placeId }, { autoCommit: true });
}
