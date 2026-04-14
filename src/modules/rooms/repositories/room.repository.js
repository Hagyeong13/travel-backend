import { executeQuery, fetchOne } from '../../../common/repositories/base.repository.js';

export async function createRoom({
  id,
  name,
  startDate,
  endDate,
  totalBudget,
  status = 'OPEN'
}) {
  const sql = `
    INSERT INTO rooms (id, name, start_date, end_date, total_budget, status, created_at, updated_at)
    VALUES (
      :id,
      :name,
      TO_DATE(:startDate, 'YYYY-MM-DD'),
      TO_DATE(:endDate, 'YYYY-MM-DD'),
      :totalBudget,
      :status,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `;

  await executeQuery(sql, { id, name, startDate, endDate, totalBudget, status }, { autoCommit: true });
  return findRoomById(id);
}

export async function findRoomById(id) {
  const sql = `SELECT * FROM rooms WHERE id = :id`;
  return fetchOne(sql, { id });
}
