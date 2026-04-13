import express from 'express';
import { findRoomById } from './modules/rooms/repositories/room.repository.js';

const app = express();

app.get('/rooms', async (req, res) => {
  const rooms = await findRoomById('1');
  res.json(rooms);
});

app.listen(3000, () => console.log('server running'));