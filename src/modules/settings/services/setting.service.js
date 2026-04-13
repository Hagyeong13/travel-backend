import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { settingRepository } from '../repositories/index.js';
import { field, toDateString, toDateTimeString } from '../../../common/utils/dto.js';

export const getSettings = async ({ roomId, memberId }) => {
  const { room, members, inviteLinks } = await settingRepository.findRoomSettingsByRoomId(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  const member = members.find((m) => field(m, 'id') === memberId);
  if (!member || field(member, 'room_id') !== roomId) throw new AppError(ERROR_CODES.MEMBER_40301);

  const latestInviteLink = inviteLinks[0] ?? null;
  const inviteToken = latestInviteLink ? field(latestInviteLink, 'token') : null;

  return {
    members: members.map(m => ({
      memberId: field(m, 'id'),
      name: field(m, 'name'),
      role: field(m, 'role')
    })),
    invite: {
      token: inviteToken,
      inviteUrl: inviteToken
        ? `http://localhost:${process.env.PORT ?? 3000}/invite/${inviteToken}`
        : null
    },
    room: {
      roomId: field(room, 'id'),
      name: field(room, 'name'),
      startDate: toDateString(field(room, 'start_date')),
      endDate: toDateString(field(room, 'end_date')),
      createdAt: toDateTimeString(field(room, 'created_at'))
    }
  };
};
