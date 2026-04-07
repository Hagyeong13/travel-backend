import express from 'express';
import dotenv from 'dotenv';

import roomRoutes from './modules/rooms/controllers/room.routes.js';
import placeRoutes from './modules/places/controllers/place.routes.js';
import voteRoutes from './modules/votes/controllers/vote.routes.js';
import settingRoutes from './modules/settings/controllers/setting.routes.js';

import { swaggerSpec, swaggerUi } from './common/swagger/swagger.js';
import { errorHandler } from './common/errors/errorHandler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1', roomRoutes);
app.use('/api/v1', placeRoutes);
app.use('/api/v1', voteRoutes);
app.use('/api/v1', settingRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 에러 핸들러는 라우터 뒤에
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});