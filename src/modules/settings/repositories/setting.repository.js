import { fetchAll, fetchOne } from '../../../common/repositories/base.repository.js';

export async function findRoomSettingsByRoomId(roomId) {
  const roomSql = `SELECT * FROM rooms WHERE id = :roomId`;
  const membersSql = `SELECT * FROM members WHERE room_id = :roomId`;
  const inviteSql = `
    SELECT * FROM invite_links
    WHERE room_id = :roomId
    ORDER BY created_at DESC
  `;

  const [room, members, inviteLinks] = await Promise.all([
    fetchOne(roomSql, { roomId }),
    fetchAll(membersSql, { roomId }),
    fetchAll(inviteSql, { roomId })
  ]);

  return {
    room,
    members,
    inviteLinks
  };
}
