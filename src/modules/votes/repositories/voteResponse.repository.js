import { executeInTransaction, executeQuery, fetchAll } from '../../../common/repositories/base.repository.js';

export async function createVoteResponse({ id, voteId, voteOptionId, memberId }) {
  const sql = `
    INSERT INTO vote_responses (id, vote_id, vote_option_id, member_id, created_at)
    VALUES (:id, :voteId, :voteOptionId, :memberId, CURRENT_TIMESTAMP)
  `;

  await executeQuery(sql, { id, voteId, voteOptionId, memberId }, { autoCommit: true });
}

export async function findVoteResponsesByVoteId(voteId) {
  const sql = `SELECT * FROM vote_responses WHERE vote_id = :voteId`;
  return fetchAll(sql, { voteId });
}

export async function deleteVoteResponseByMember({ voteId, memberId }) {
  const sql = `
    DELETE FROM vote_responses
    WHERE vote_id = :voteId AND member_id = :memberId
  `;
  await executeQuery(sql, { voteId, memberId }, { autoCommit: true });
}

export async function upsertVoteResponseByMember({ id, voteId, voteOptionId, memberId }) {
  const deleteSql = `
    DELETE FROM vote_responses
    WHERE vote_id = :voteId AND member_id = :memberId
  `;
  const insertSql = `
    INSERT INTO vote_responses (id, vote_id, vote_option_id, member_id, created_at)
    VALUES (:id, :voteId, :voteOptionId, :memberId, CURRENT_TIMESTAMP)
  `;

  await executeInTransaction(async (connection) => {
    await connection.execute(deleteSql, { voteId, memberId });
    await connection.execute(insertSql, { id, voteId, voteOptionId, memberId });
  });
}

export async function deleteVoteResponsesByVoteId(voteId) {
  const sql = `
    DELETE FROM vote_responses
    WHERE vote_id = :voteId
  `;
  await executeQuery(sql, { voteId }, { autoCommit: true });
}

export async function findVoteCountsByVoteId(voteId) {
  const sql = `
    SELECT vote_option_id, COUNT(*) AS vote_count
    FROM vote_responses
    WHERE vote_id = :voteId
    GROUP BY vote_option_id
  `;
  return fetchAll(sql, { voteId });
}

export async function countTotalVotesByVoteId(voteId) {
  const sql = `
    SELECT COUNT(*) AS total_vote_count
    FROM vote_responses
    WHERE vote_id = :voteId
  `;
  const rows = await fetchAll(sql, { voteId });
  return rows[0] ?? null;
}
