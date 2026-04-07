import * as settingService from '../services/setting.service.js';
import { successResponse } from '../../../common/responses/response.js';

export const getSettings = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const memberId = req.header('X-Member-Id');

    const result = await settingService.getSettings({
      roomId,
      memberId
    });

    return res.json(successResponse(result, '설정 화면 조회에 성공했습니다.'));
  } catch (err) {
    next(err);
  }
};