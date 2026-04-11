import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { randomUUID } from 'crypto';

// In-memory stores (D파트에서 DB로 교체 예정)
export const rooms = new Map();       // roomId -> room
export const members = new Map();     // memberId -> member
export const inviteTokens = new Map(); // token -> roomId

export const createRoom = async ({ name, startDate, endDate }) => {
  if (!name) throw new AppError(ERROR_CODES.ROOM_40001);
  if (new Date(startDate) > new Date(endDate)) {
    throw new AppError(ERROR_CODES.ROOM_40002);
  }

  const roomId = randomUUID();
  const inviteToken = randomUUID().replace(/-/g, '').substring(0, 12);

  const room = {
    roomId,
    name,
    startDate,
    endDate,
    inviteToken,
    createdAt: new Date().toISOString()
  };

  rooms.set(roomId, room);
  inviteTokens.set(inviteToken, roomId);

  return { roomId, name, startDate, endDate, inviteToken };
};

export const enterRoom = async ({ token, name, password }) => {
  // 초대 토큰 검증
  const roomId = inviteTokens.get(token);
  if (!roomId) throw new AppError(ERROR_CODES.INVITE_40401);

  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  // 동일 이름 멤버 존재 여부 확인
  const existingMember = [...members.values()].find(
    m => m.roomId === roomId && m.name === name
  );

  if (existingMember) {
    // 재입장: 비밀번호 검증
    if (existingMember.password !== password) {
      throw new AppError(ERROR_CODES.MEMBER_40101);
    }
    return {
      roomId,
      memberId: existingMember.memberId,
      name: existingMember.name,
      role: existingMember.role,
      token
    };
  }

  // 신규 멤버: 방에서 첫 번째 입장자 → HOST
  const roomMembers = [...members.values()].filter(m => m.roomId === roomId);
  const role = roomMembers.length === 0 ? 'HOST' : 'MEMBER';

  const memberId = randomUUID();
  const member = {
    memberId,
    roomId,
    name,
    password,
    role,
    createdAt: new Date().toISOString()
  };
  members.set(memberId, member);

  return { roomId, memberId, name, role, token };
};

export const getRoomSummary = async ({ roomId }) => {
  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  return {
    roomId: room.roomId,
    name: room.name,
    startDate: room.startDate,
    endDate: room.endDate
  };
};
