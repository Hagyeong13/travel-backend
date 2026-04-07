import * as placeService from '../services/place.service.js';
import { successResponse } from '../../../common/responses/response.js';

export const getPlanner = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await placeService.getPlanner({ roomId, memberId });

    return res.json(successResponse(result, '일정 플래너 조회에 성공했습니다.'));
  } catch (err) {
    next(err);
  }
};

export const createPlace = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { title, sourceUrl, memo, estimatedCost } = req.body;

    const result = await placeService.createPlace({
      roomId,
      memberId,
      title,
      sourceUrl,
      memo,
      estimatedCost
    });

    return res.json(successResponse(result, '장소가 추가되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const updatePlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { title, sourceUrl, memo, estimatedCost, isRequired } = req.body;

    const result = await placeService.updatePlace({
      placeId,
      memberId,
      title,
      sourceUrl,
      memo,
      estimatedCost,
      isRequired
    });

    return res.json(successResponse(result, '장소가 수정되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const deletePlace = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await placeService.deletePlace({
      placeId,
      memberId
    });

    return res.json(successResponse(result, '장소가 삭제되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const updatePlaceReaction = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { reactionType } = req.body;

    const result = await placeService.updatePlaceReaction({
      placeId,
      memberId,
      reactionType
    });

    return res.json(successResponse(result, '장소 리액션이 변경되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const updatePlaceRequired = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { isRequired } = req.body;

    const result = await placeService.updatePlaceRequired({
      placeId,
      memberId,
      isRequired
    });

    return res.json(successResponse(result, '장소 필수 여부가 변경되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const getPlaceComments = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await placeService.getPlaceComments({
      placeId,
      memberId
    });

    return res.json(successResponse(result, '장소 댓글 목록 조회에 성공했습니다.'));
  } catch (err) {
    next(err);
  }
};

export const createPlaceComment = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { content } = req.body;

    const result = await placeService.createPlaceComment({
      placeId,
      memberId,
      content
    });

    return res.json(successResponse(result, '댓글이 작성되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const createScheduleItem = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { placeId, title, date, startTime, endTime, memo } = req.body;

    const result = await placeService.createScheduleItem({
      roomId,
      memberId,
      placeId,
      title,
      date,
      startTime,
      endTime,
      memo
    });

    return res.json(successResponse(result, '일정이 추가되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const deleteScheduleItem = async (req, res, next) => {
  try {
    const { scheduleItemId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await placeService.deleteScheduleItem({
      scheduleItemId,
      memberId
    });

    return res.json(successResponse(result, '일정 아이템이 삭제되었습니다.'));
  } catch (err) {
    next(err);
  }
};