import express from 'express';
import {
  getPlanner,
  createPlace,
  updatePlace,
  deletePlace,
  updatePlaceReaction,
  updatePlaceRequired,
  getPlaceComments,
  createPlaceComment,
  createScheduleItem,
  deleteScheduleItem
} from './place.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Planner
 *   description: 일정 플래너 / 장소 API
 */

/**
 * @swagger
 * /rooms/{roomId}/planner:
 *   get:
 *     summary: 일정 플래너 조회
 *     tags: [Planner]
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
 *         description: 일정 플래너 조회 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 방 없음
 */
router.get('/rooms/:roomId/planner', getPlanner);

/**
 * @swagger
 * /rooms/{roomId}/places:
 *   post:
 *     summary: 새 장소 추가
 *     tags: [Planner]
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
 *             required: [title, sourceUrl]
 *             properties:
 *               title:
 *                 type: string
 *                 example: 성산일출봉
 *               sourceUrl:
 *                 type: string
 *                 example: https://map.naver.com/...
 *               memo:
 *                 type: string
 *                 example: 저녁 산책 가능
 *               estimatedCost:
 *                 type: number
 *                 example: 20000
 *     responses:
 *       200:
 *         description: 장소 추가 성공
 *       400:
 *         description: 잘못된 장소 요청
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 방 없음
 */
router.post('/rooms/:roomId/places', createPlace);

/**
 * @swagger
 * /places/{placeId}:
 *   patch:
 *     summary: 장소 수정
 *     tags: [Planner]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 장소 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: 블루보틀 성수
 *               sourceUrl:
 *                 type: string
 *                 example: https://www.google.com/maps/...
 *               memo:
 *                 type: string
 *                 example: 아침 일정이랑 묶기 좋음
 *               estimatedCost:
 *                 type: number
 *                 example: 8000
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 장소 수정 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 장소 없음
 *       409:
 *         description: 확정된 장소는 수정 불가
 */
router.patch('/places/:placeId', updatePlace);

/**
 * @swagger
 * /places/{placeId}:
 *   delete:
 *     summary: 장소 삭제
 *     tags: [Planner]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 장소 ID
 *     responses:
 *       200:
 *         description: 장소 삭제 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 장소 없음
 *       409:
 *         description: 확정된 장소는 삭제 불가
 */
router.delete('/places/:placeId', deletePlace);

/**
 * @swagger
 * /places/{placeId}/reaction:
 *   patch:
 *     summary: 장소 리액션 변경
 *     tags: [Planner]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 장소 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reactionType]
 *             properties:
 *               reactionType:
 *                 type: string
 *                 enum: [LIKE, DISLIKE, NONE]
 *                 example: LIKE
 *     responses:
 *       200:
 *         description: 장소 리액션 변경 성공
 *       400:
 *         description: 잘못된 반응 타입
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 장소 없음
 *       409:
 *         description: 확정된 장소는 리액션 변경 불가
 */
router.patch('/places/:placeId/reaction', updatePlaceReaction);

/**
 * @swagger
 * /places/{placeId}/required:
 *   patch:
 *     summary: 장소 필수 여부 변경
 *     tags: [Planner]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 장소 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isRequired]
 *             properties:
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 장소 필수 여부 변경 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 장소 없음
 *       409:
 *         description: 확정된 장소는 필수 여부 변경 불가
 */
router.patch('/places/:placeId/required', updatePlaceRequired);

/**
 * @swagger
 * /places/{placeId}/comments:
 *   get:
 *     summary: 장소 댓글 목록 조회
 *     tags: [Planner]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 장소 ID
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 장소 없음
 */
router.get('/places/:placeId/comments', getPlaceComments);

/**
 * @swagger
 * /places/{placeId}/comments:
 *   post:
 *     summary: 장소 댓글 작성
 *     tags: [Planner]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: 장소 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: 웨이팅 길 수 있어요
 *     responses:
 *       200:
 *         description: 댓글 작성 성공
 *       400:
 *         description: 댓글 내용 누락
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 장소 없음
 *       409:
 *         description: 확정된 장소는 댓글 작성 불가
 */
router.post('/places/:placeId/comments', createPlaceComment);

/**
 * @swagger
 * /rooms/{roomId}/schedule-items:
 *   post:
 *     summary: 일정 추가
 *     tags: [Planner]
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
 *             properties:
 *               placeId:
 *                 type: string
 *                 nullable: true
 *                 example: place-uuid
 *               title:
 *                 type: string
 *                 nullable: true
 *                 example: 취침
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-06
 *               startTime:
 *                 type: string
 *                 example: 09:00
 *               endTime:
 *                 type: string
 *                 example: 10:00
 *               memo:
 *                 type: string
 *                 nullable: true
 *                 example: 공항에서 숙소 이동
 *     responses:
 *       200:
 *         description: 일정 추가 성공
 *       400:
 *         description: 잘못된 일정 요청
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 방 또는 일정 일자 없음
 *       409:
 *         description: 일정 시간 충돌
 */
router.post('/rooms/:roomId/schedule-items', createScheduleItem);

/**
 * @swagger
 * /schedule-items/{scheduleItemId}:
 *   delete:
 *     summary: 일정 아이템 삭제
 *     tags: [Planner]
 *     security:
 *       - MemberIdHeader: []
 *     parameters:
 *       - in: path
 *         name: scheduleItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: 일정 아이템 ID
 *     responses:
 *       200:
 *         description: 일정 삭제 성공
 *       403:
 *         description: 방 소속 멤버가 아님
 *       404:
 *         description: 일정 아이템 없음
 */
router.delete('/schedule-items/:scheduleItemId', deleteScheduleItem);

export default router;