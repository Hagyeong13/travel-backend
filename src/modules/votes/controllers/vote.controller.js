import * as voteService from '../services/vote.service.js';
import { successResponse } from '../../../common/responses/response.js';

export const createVote = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { title, deadline, options } = req.body;

    const result = await voteService.createVote({
      roomId,
      memberId,
      title,
      deadline,
      options
    });

    return res.json(successResponse(result, '투표가 생성되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const getVotes = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await voteService.getVotes({
      roomId,
      memberId
    });

    return res.json(successResponse(result, '투표 목록 조회에 성공했습니다.'));
  } catch (err) {
    next(err);
  }
};

export const vote = async (req, res, next) => {
  try {
    const { voteId } = req.params;
    const memberId = req.header('X-Member-Id');
    const { voteOptionId } = req.body;

    const result = await voteService.vote({
      voteId,
      memberId,
      voteOptionId
    });

    return res.json(successResponse(result, '투표가 반영되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const closeVote = async (req, res, next) => {
  try {
    const { voteId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await voteService.closeVote({
      voteId,
      memberId
    });

    return res.json(successResponse(result, '투표가 마감되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const deleteVote = async (req, res, next) => {
  try {
    const { voteId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await voteService.deleteVote({
      voteId,
      memberId
    });

    return res.json(successResponse(result, '투표가 삭제되었습니다.'));
  } catch (err) {
    next(err);
  }
};