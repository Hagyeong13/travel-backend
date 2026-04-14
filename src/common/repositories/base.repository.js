import { getConnection } from '../../config/db.js';

export async function executeQuery(sql, binds = {}, options = {}) {
  const connection = await getConnection();

  try {
    const result = await connection.execute(sql, binds, options);
    return result;
  } finally {
    await connection.close();
  }
}

export async function fetchAll(sql, binds = {}, options = {}) {
  const result = await executeQuery(sql, binds, options);
  return result.rows ?? [];
}

export async function fetchOne(sql, binds = {}, options = {}) {
  const rows = await fetchAll(sql, binds, options);
  return rows[0] ?? null;
}

export async function executeInTransaction(work) {
  const connection = await getConnection();
  try {
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}
