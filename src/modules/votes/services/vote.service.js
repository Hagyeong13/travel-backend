import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { randomUUID } from 'crypto';
import { rooms, members } from '../../rooms/services/room.service.js';
import { places } from '../../places/services/place.service.js';

// In-memory stores (D파트에서 DB로 교체 예정)
const votes = new Map();         // voteId -> vote
const voteResponses = new Map(); // `${voteId}:${memberId}` -> voteOptionId

// --- 내부 헬퍼 ---

// deadline이 지났으면 자동 마감 처리
const checkDeadline = (vote) => {
  if (vote.status === 'CLOSED') return;
  if (vote.deadline && new Date(vote.deadline) < new Date()) {
    vote.status = 'CLOSED';
  }
};

const getOptionsWithCounts = (vote) => {
  return vote.options.map(opt => {
    const voteCount = [...voteResponses.entries()].filter(
      ([key, val]) => key.startsWith(`${vote.voteId}:`) && val === opt.voteOptionId
    ).length;
    return { ...opt, voteCount };
  });
};

// --- 서비스 함수 ---

export const createVote = async ({ roomId, memberId, title, deadline, options }) => {
  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  const member = members.get(memberId);
  if (!member || member.roomId !== roomId) throw new AppError(ERROR_CODES.MEMBER_40301);

  if (!title) throw new AppError(ERROR_CODES.VOTE_40002);
  if (!options || options.length < 2) throw new AppError(ERROR_CODES.VOTE_40003);
  if (deadline && new Date(deadline) <= new Date()) throw new AppError(ERROR_CODES.VOTE_40004);

  const voteId = randomUUID();
  const voteOptions = options.map(({ placeId }) => {
    const place = places.get(placeId);
    if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
    if (place.roomId !== roomId) throw new AppError(ERROR_CODES.VOTE_40902);
    return {
      voteOptionId: randomUUID(),
      placeId,
      label: place.title,
      linkUrl: place.sourceUrl ?? null,
      voteCount: 0
    };
  });

  const vote = {
    voteId,
    roomId,
    memberId,
    title,
    deadline: deadline ?? null,
    status: 'OPEN',
    options: voteOptions,
    createdAt: new Date().toISOString()
  };
  votes.set(voteId, vote);

  return {
    voteId,
    roomId,
    memberId,
    title,
    deadline: vote.deadline,
    status: 'OPEN',
    options: voteOptions
  };
};

export const getVotes = async ({ roomId, memberId }) => {
  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);

  const roomVotes = [...votes.values()]
    .filter(v => v.roomId === roomId)
    .map(v => {
      checkDeadline(v);
      const myVoteOptionId = voteResponses.get(`${v.voteId}:${memberId}`) ?? null;
      return {
        ...v,
        options: getOptionsWithCounts(v),
        myVoteOptionId
      };
    });

  return { roomId, votes: roomVotes };
};

export const vote = async ({ voteId, memberId, voteOptionId }) => {
  const v = votes.get(voteId);
  if (!v) throw new AppError(ERROR_CODES.VOTE_40401);

  checkDeadline(v);
  if (v.status === 'CLOSED') throw new AppError(ERROR_CODES.VOTE_RESPONSE_40901);

  const option = v.options.find(o => o.voteOptionId === voteOptionId);
  if (!option) throw new AppError(ERROR_CODES.VOTE_OPTION_40401);

  // 1인 1선택지: 기존 응답을 덮어씀 (변경 가능)
  voteResponses.set(`${voteId}:${memberId}`, voteOptionId);

  return {
    voteId,
    memberId,
    myVoteOptionId: voteOptionId,
    options: getOptionsWithCounts(v)
  };
};

export const closeVote = async ({ voteId, memberId }) => {
  const v = votes.get(voteId);
  if (!v) throw new AppError(ERROR_CODES.VOTE_40401);
  if (v.status === 'CLOSED') throw new AppError(ERROR_CODES.VOTE_40901);

  v.status = 'CLOSED';

  return { voteId, memberId, status: 'CLOSED' };
};

export const deleteVote = async ({ voteId, memberId }) => {
  const v = votes.get(voteId);
  if (!v) throw new AppError(ERROR_CODES.VOTE_40401);

  // 연관 응답 정리
  for (const key of voteResponses.keys()) {
    if (key.startsWith(`${voteId}:`)) voteResponses.delete(key);
  }
  votes.delete(voteId);

  return { voteId, memberId };
};
