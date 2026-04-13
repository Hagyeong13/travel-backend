import { executeInTransaction, executeQuery, fetchAll, fetchOne } from '../../../common/repositories/base.repository.js';

export async function createVote({
  id,
  roomId,
  createdByMemberId,
  title,
  description,
  voteType,
  deadline,
  status = 'OPEN'
}) {
  const sql = `
    INSERT INTO votes (
      id, room_id, created_by_member_id, title, description,
      vote_type, deadline, status, created_at
    )
    VALUES (
      :id, :roomId, :createdByMemberId, :title, :description,
      :voteType, :deadline, :status, CURRENT_TIMESTAMP
    )
  `;

  await executeQuery(
    sql,
    { id, roomId, createdByMemberId, title, description, voteType, deadline, status },
    { autoCommit: true }
  );

  return findVoteById(id);
}

export async function createVoteWithOptions({
  vote,
  options
}) {
  const voteSql = `
    INSERT INTO votes (
      id, room_id, created_by_member_id, title, description,
      vote_type, deadline, status, created_at
    )
    VALUES (
      :id, :roomId, :createdByMemberId, :title, :description,
      :voteType, :deadline, :status, CURRENT_TIMESTAMP
    )
  `;

  const optionSql = `
    INSERT INTO vote_options (id, vote_id, place_id, option_text, option_date, option_time)
    VALUES (:id, :voteId, :placeId, :optionText, :optionDate, :optionTime)
  `;

  await executeInTransaction(async (connection) => {
    await connection.execute(voteSql, vote);

    for (const option of options) {
      await connection.execute(optionSql, {
        ...option,
        voteId: vote.id
      });
    }
  });

  return findVoteById(vote.id);
}

export async function findVoteById(id) {
  return fetchOne(`SELECT * FROM votes WHERE id = :id`, { id });
}

export async function findVotesByRoomId(roomId) {
  return fetchAll(`SELECT * FROM votes WHERE room_id = :roomId`, { roomId });
}

export async function updateVoteStatus(id, status) {
  const sql = `
    UPDATE votes
    SET status = :status
    WHERE id = :id
  `;
  await executeQuery(sql, { id, status }, { autoCommit: true });
}

export async function deleteVoteById(id) {
  await executeQuery(`DELETE FROM votes WHERE id = :id`, { id }, { autoCommit: true });
}

export async function deleteVoteCascadeById(id) {
  const deleteResponsesSql = `
    DELETE FROM vote_responses
    WHERE vote_id = :id
  `;
  const deleteOptionsSql = `
    DELETE FROM vote_options
    WHERE vote_id = :id
  `;
  const deleteVoteSql = `
    DELETE FROM votes
    WHERE id = :id
  `;

  await executeInTransaction(async (connection) => {
    await connection.execute(deleteResponsesSql, { id });
    await connection.execute(deleteOptionsSql, { id });
    await connection.execute(deleteVoteSql, { id });
  });
}
