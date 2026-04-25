import { executeQuery, fetchAll } from '../../../common/repositories/base.repository.js';

export async function createVoteOption({
  id,
  voteId,
  placeId = null,
  optionText,
  optionDate = null,
  optionTime = null
}) {
  const sql = `
    INSERT INTO vote_options (id, vote_id, place_id, option_text, option_date, option_time)
    VALUES (:id, :voteId, :placeId, :optionText, :optionDate, :optionTime)
  `;

  await executeQuery(
    sql,
    { id, voteId, placeId, optionText, optionDate, optionTime },
    { autoCommit: true }
  );
}

export async function findVoteOptionsByVoteId(voteId) {
  const sql = `SELECT * FROM vote_options WHERE vote_id = :voteId`;
  return fetchAll(sql, { voteId });
}

export async function deleteVoteOptionsByVoteId(voteId) {
  const sql = `DELETE FROM vote_options WHERE vote_id = :voteId`;
  await executeQuery(sql, { voteId }, { autoCommit: true });
}
