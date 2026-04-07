import express from 'express';
import {
  createVote,
  getVotes,
  vote,
  closeVote,
  deleteVote
} from './vote.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Votes
 *   description: 투표 API
 */

/**
 * @swagger
 * /rooms/{roomId}/votes:
 *   post:
 *     summary: 투표 생성
 *     tags: [Votes]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: 방 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, options]
 *             properties:
 *               title:
 *                 type: string
 *                 example: 어디로 갈까요?
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: 2026-04-10T18:00:00
 *               options:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: object
 *                   properties:
 *                     placeId:
 *                       type: string
 *                       example: place-1
 *     responses:
 *       200:
 *         description: 투표 생성 성공
 *       400:
 *         description: 잘못된 투표 요청
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 방 없음
 *       409:
 *         description: 같은 방에 속하지 않는 장소를 선택지로 지정함
 */
router.post('/rooms/:roomId/votes', createVote);

/**
 * @swagger
 * /rooms/{roomId}/votes:
 *   get:
 *     summary: 투표 목록 조회
 *     tags: [Votes]
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
 *         description: 투표 목록 조회 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 방 없음
 */
router.get('/rooms/:roomId/votes', getVotes);

/**
 * @swagger
 * /votes/{voteId}/response:
 *   patch:
 *     summary: 투표 참여 / 변경
 *     tags: [Votes]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: string
 *         description: 투표 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [voteOptionId]
 *             properties:
 *               voteOptionId:
 *                 type: string
 *                 example: option-1
 *     responses:
 *       200:
 *         description: 투표 반영 성공
 *       400:
 *         description: 잘못된 투표 참여 요청
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 투표 또는 선택지 없음
 *       409:
 *         description: 마감된 투표에는 참여할 수 없음
 */
router.patch('/votes/:voteId/response', vote);

/**
 * @swagger
 * /votes/{voteId}/close:
 *   patch:
 *     summary: 투표 마감
 *     tags: [Votes]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: string
 *         description: 투표 ID
 *     responses:
 *       200:
 *         description: 투표 마감 성공
 *       403:
 *         description: 방 소속 멤버가 아니거나 권한 없음
 *       404:
 *         description: 투표 없음
 *       409:
 *         description: 이미 마감된 투표
 */
router.patch('/votes/:voteId/close', closeVote);

/**
 * @swagger
 * /votes/{voteId}:
 *   delete:
 *     summary: 투표 삭제
 *     tags: [Votes]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: string
 *         description: 투표 ID
 *     responses:
 *       200:
 *         description: 투표 삭제 성공
 *       403:
 *         description: 방 소속 멤버가 아니거나 권한 없음
 *       404:
 *         description: 투표 없음
 */
router.delete('/votes/:voteId', deleteVote);

export default router;