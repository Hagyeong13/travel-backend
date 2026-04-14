import { executeQuery, fetchOne } from '../../../common/repositories/base.repository.js';

export async function createInviteLink({ id, roomId, token }) {
  const sql = `
    INSERT INTO invite_links (id, room_id, token, created_at)
    VALUES (:id, :roomId, :token, CURRENT_TIMESTAMP)
  `;

  await executeQuery(sql, { id, roomId, token }, { autoCommit: true });
  return findInviteLinkByToken(token);
}

export async function findInviteLinkByToken(token) {
  const sql = `SELECT * FROM invite_links WHERE token = :token`;
  return fetchOne(sql, { token });
}
