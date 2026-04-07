import * as roomService from '../services/room.service.js';
import { successResponse } from '../../../common/responses/response.js';

export const createRoom = async (req, res, next) => {
  try {
    const { name, startDate, endDate, totalBudget, hostName, hostPassword } = req.body;

    const result = await roomService.createRoom({
      name,
      startDate,
      endDate,
      totalBudget,
      hostName,
      hostPassword
    });

    return res.json(successResponse(result, '방 생성이 완료되었습니다.'));
  } catch (err) {
    next(err);
  }
};

export const enterRoom = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { name, password } = req.body;

    const result = await roomService.enterRoom({
      token,
      name,
      password
    });

    return res.json(successResponse(result, '방 입장에 성공했습니다.'));
  } catch (err) {
    next(err);
  }
};

export const getRoomSummary = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const result = await roomService.getRoomSummary({ roomId });

    return res.json(successResponse(result, '방 요약 조회에 성공했습니다.'));
  } catch (err) {
    next(err);
  }
};