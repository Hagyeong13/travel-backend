import { executeQuery, fetchAll } from '../../../common/repositories/base.repository.js';

export async function createItineraryDay({ id, roomId, travelDate, dayOrder }) {
  const sql = `
    INSERT INTO itinerary_days (id, room_id, travel_date, day_order)
    VALUES (:id, :roomId, TO_DATE(:travelDate, 'YYYY-MM-DD'), :dayOrder)
  `;

  await executeQuery(sql, { id, roomId, travelDate, dayOrder }, { autoCommit: true });
}

export async function findItineraryDaysByRoomId(roomId) {
  const sql = `
    SELECT * FROM itinerary_days
    WHERE room_id = :roomId
    ORDER BY day_order ASC
  `;
  return fetchAll(sql, { roomId });
}

export async function findItineraryDayByRoomAndDate({ roomId, travelDate }) {
  const sql = `
    SELECT * FROM itinerary_days
    WHERE room_id = :roomId
      AND travel_date = TO_DATE(:travelDate, 'YYYY-MM-DD')
  `;
  const rows = await fetchAll(sql, { roomId, travelDate });
  return rows[0] ?? null;
}
