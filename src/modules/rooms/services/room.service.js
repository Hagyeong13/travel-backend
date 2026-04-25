import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { randomUUID } from 'crypto';
import { field, toDateString } from '../../../common/utils/dto.js';
import {
  roomRepository,
  memberRepository,
  inviteLinkRepository
} from '../repositories/index.js';

export const createRoom = async ({ name, startDate, endDate }) => {
  if (!name) throw new AppError(ERROR_CODES.ROOM_40001);
  if (new Date(startDate) > new Date(endDate)) {
    throw new AppError(ERROR_CODES.ROOM_40002);
  }

  const roomId = randomUUID();
  const inviteToken = randomUUID().replace(/-/g, '').substring(0, 12);

  await roomRepository.createRoom({
    id: roomId,
    name,
    startDate,
    endDate,
    totalBudget: null
  });
  await inviteLinkRepository.createInviteLink({
    id: randomUUID(),
    roomId,
    token: inviteToken
  });

  return {
    roomId,
    name,
    startDate: toDateString(startDate),
    endDate: toDateString(endDate),
    inviteToken
  };
};

export const enterRoom = async ({ token, name, password }) => {
  const inviteLink = await inviteLinkRepository.findInviteLinkByToken(token);
  const roomId = field(inviteLink, 'room_id');
  if (!roomId) throw new AppError(ERROR_CODES.INVITE_40401);

  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  const roomMembers = await memberRepository.findMembersByRoomId(roomId);
  const existingMember = roomMembers.find(
    m => field(m, 'name') === name
  );

  if (existingMember) {
    if (field(existingMember, 'password_hash') !== password) {
      throw new AppError(ERROR_CODES.MEMBER_40101);
    }

    const memberId = field(existingMember, 'id');
    const role = field(existingMember, 'role');
    return {
      roomId,
      memberId,
      name: field(existingMember, 'name'),
      role,
      token
    };
  }

  const role = roomMembers.length === 0 ? 'HOST' : 'MEMBER';
  const memberId = randomUUID();

  await memberRepository.createMember({
    id: memberId,
    roomId,
    name,
    passwordHash: password,
    role
  });

  return { roomId, memberId, name, role, token };
};

export const getRoomSummary = async ({ roomId }) => {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  return {
    roomId: field(room, 'id'),
    name: field(room, 'name'),
    startDate: toDateString(field(room, 'start_date')),
    endDate: toDateString(field(room, 'end_date'))
  };
};
