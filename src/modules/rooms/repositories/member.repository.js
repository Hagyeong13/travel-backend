import { executeQuery, fetchAll, fetchOne } from '../../../common/repositories/base.repository.js';

export async function createMember({
  id,
  roomId,
  name,
  passwordHash,
  role = 'MEMBER',
  status = 'ACTIVE'
}) {
  const sql = `
    INSERT INTO members (id, room_id, name, password_hash, role, joined_at, status)
    VALUES (:id, :roomId, :name, :passwordHash, :role, CURRENT_TIMESTAMP, :status)
  `;

  await executeQuery(
    sql,
    { id, roomId, name, passwordHash, role, status },
    { autoCommit: true }
  );

  return findMemberById(id);
}

export async function findMemberById(id) {
  const sql = `SELECT * FROM members WHERE id = :id`;
  return fetchOne(sql, { id });
}

export async function findMembersByRoomId(roomId) {
  const sql = `SELECT * FROM members WHERE room_id = :roomId`;
  return fetchAll(sql, { roomId });
}
