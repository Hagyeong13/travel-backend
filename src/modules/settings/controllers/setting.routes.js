import express from 'express';
import { getSettings } from './setting.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: 설정 화면 조회 API
 */

/**
 * @swagger
 * /rooms/{roomId}/settings:
 *   get:
 *     summary: 설정 화면 조회
 *     tags: [Settings]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: 방 ID
 *     responses:
 *       200:
 *         description: 설정 화면 조회 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 방 없음
 */
router.get('/rooms/:roomId/settings', getSettings);

export default router;