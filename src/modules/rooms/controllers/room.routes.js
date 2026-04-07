import express from 'express';
import {
  createRoom,
  enterRoom,
  getRoomSummary
} from './room.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: 홈 / 방 관련 API
 */

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: 방 생성
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startDate, endDate, hostName, hostPassword]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 제주도 힐링 여행
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-06
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-08
 *               totalBudget:
 *                 type: number
 *                 example: 300000
 *               hostName:
 *                 type: string
 *                 example: 하경
 *               hostPassword:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: 방 생성 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/rooms', createRoom);

/**
 * @swagger
 * /invite-links/{token}/enter:
 *   post:
 *     summary: 링크 입장 / 재입장
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 초대 링크 토큰
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 민수
 *               password:
 *                 type: string
 *                 example: 5678
 *     responses:
 *       200:
 *         description: 방 입장 성공
 *       401:
 *         description: 이름 또는 비밀번호 불일치
 *       404:
 *         description: 초대 링크 없음
 *       410:
 *         description: 만료되었거나 유효하지 않은 링크
 */
router.post('/invite-links/:token/enter', enterRoom);

/**
 * @swagger
 * /rooms/{roomId}/summary:
 *   get:
 *     summary: 방 요약 조회
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: 방 ID
 *     responses:
 *       200:
 *         description: 방 요약 조회 성공
 *       404:
 *         description: 존재하지 않는 방
 */
router.get('/rooms/:roomId/summary', getRoomSummary);

export default router;