import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { rooms, members } from '../../rooms/services/room.service.js';

export const getSettings = async ({ roomId, memberId }) => {
  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  const member = members.get(memberId);
  if (!member || member.roomId !== roomId) throw new AppError(ERROR_CODES.MEMBER_40301);

  const roomMembers = [...members.values()]
    .filter(m => m.roomId === roomId)
    .map(m => ({ memberId: m.memberId, name: m.name, role: m.role }));

  return {
    members: roomMembers,
    invite: {
      token: room.inviteToken,
      inviteUrl: `http://localhost:${process.env.PORT ?? 3000}/invite/${room.inviteToken}`
    },
    room: {
      roomId: room.roomId,
      name: room.name,
      startDate: room.startDate,
      endDate: room.endDate,
      createdAt: room.createdAt
    }
  };
};
