import { executeQuery, fetchAll } from '../../../common/repositories/base.repository.js';

export async function createItineraryItem({
  id,
  itineraryDayId,
  placeId = null,
  title,
  startTime = null,
  endTime = null,
  sequenceNo,
  memo
}) {
  const sql = `
    INSERT INTO itinerary_items (
      id, itinerary_day_id, place_id, title, start_time, end_time, sequence_no, memo
    )
    VALUES (
      :id, :itineraryDayId, :placeId, :title, :startTime, :endTime, :sequenceNo, :memo
    )
  `;

  await executeQuery(
    sql,
    { id, itineraryDayId, placeId, title, startTime, endTime, sequenceNo, memo },
    { autoCommit: true }
  );
}

export async function findItineraryItemsByDayId(itineraryDayId) {
  const sql = `
    SELECT * FROM itinerary_items
    WHERE itinerary_day_id = :itineraryDayId
    ORDER BY sequence_no ASC
  `;
  return fetchAll(sql, { itineraryDayId });
}

export async function findItineraryItemsByRoomId(roomId) {
  const sql = `
    SELECT ii.*, iday.travel_date, iday.day_order
    FROM itinerary_items ii
    JOIN itinerary_days iday ON iday.id = ii.itinerary_day_id
    WHERE iday.room_id = :roomId
    ORDER BY iday.day_order ASC, ii.start_time ASC
  `;
  return fetchAll(sql, { roomId });
}

export async function findItineraryItemsByPlaceId(placeId) {
  const sql = `
    SELECT * FROM itinerary_items
    WHERE place_id = :placeId
  `;
  return fetchAll(sql, { placeId });
}

export async function deleteItineraryItemById(id) {
  const sql = `DELETE FROM itinerary_items WHERE id = :id`;
  await executeQuery(sql, { id }, { autoCommit: true });
}

export async function findItineraryItemById(id) {
  const sql = `
    SELECT ii.*, iday.room_id, iday.travel_date
    FROM itinerary_items ii
    JOIN itinerary_days iday ON iday.id = ii.itinerary_day_id
    WHERE ii.id = :id
  `;
  const rows = await fetchAll(sql, { id });
  return rows[0] ?? null;
}
