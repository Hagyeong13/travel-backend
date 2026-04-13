import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];
if (process.env.ORACLE_CLIENT_LIB_DIR) {
  try {
    oracledb.initOracleClient({
      libDir: process.env.ORACLE_CLIENT_LIB_DIR
    });
  } catch (error) {
    // already initialized in another import cycle
    if (!String(error.message).includes('NJS-077')) {
      throw error;
    }
  }
}

export async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
  });
}