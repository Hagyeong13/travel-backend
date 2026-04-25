import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { randomUUID } from 'crypto';
import { field, toDateTimeString } from '../../../common/utils/dto.js';
import { roomRepository, memberRepository } from '../../rooms/repositories/index.js';
import { placeRepository } from '../../places/repositories/index.js';
import {
  voteRepository,
  voteOptionRepository,
  voteResponseRepository
} from '../repositories/index.js';

// --- 내부 헬퍼 ---

const checkDeadline = (vote) => {
  if (field(vote, 'status') === 'CLOSED') return;
  if (field(vote, 'deadline') && new Date(field(vote, 'deadline')) < new Date()) {
    vote.status = 'CLOSED';
    vote.STATUS = 'CLOSED';
  }
};

const toVoteDto = async (vote, memberId = null) => {
  const voteId = field(vote, 'id');
  const options = await voteOptionRepository.findVoteOptionsByVoteId(voteId);
  const counts = await voteResponseRepository.findVoteCountsByVoteId(voteId);
  const totalVotes = await voteResponseRepository.countTotalVotesByVoteId(voteId);
  const responses = await voteResponseRepository.findVoteResponsesByVoteId(voteId);

  const countByOptionId = new Map(
    counts.map(c => [field(c, 'vote_option_id'), Number(field(c, 'vote_count') ?? 0)])
  );

  const myVoteOptionId = memberId
    ? field(responses.find(r => field(r, 'member_id') === memberId), 'vote_option_id') ?? null
    : null;

  return {
    voteId,
    roomId: field(vote, 'room_id'),
    memberId: field(vote, 'created_by_member_id'),
    title: field(vote, 'title'),
    deadline: toDateTimeString(field(vote, 'deadline')),
    status: field(vote, 'status'),
    options: options.map(opt => ({
      voteOptionId: field(opt, 'id'),
      placeId: field(opt, 'place_id'),
      label: field(opt, 'option_text'),
      linkUrl: null,
      voteCount: countByOptionId.get(field(opt, 'id')) ?? 0
    })),
    totalVoteCount: Number(field(totalVotes, 'total_vote_count') ?? 0),
    myVoteOptionId
  };
};

const assertMemberInRoom = async (memberId, roomId) => {
  const member = await memberRepository.findMemberById(memberId);
  if (!member || field(member, 'room_id') !== roomId) {
    throw new AppError(ERROR_CODES.MEMBER_40301);
  }
};

const assertRoomExists = async (roomId) => {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);
};

const updateVoteStatusIfDeadlinePassed = async (vote) => {
  const currentVote = {
    status: field(vote, 'status'),
    deadline: field(vote, 'deadline')
  };
  checkDeadline(currentVote);

  if (currentVote.status === 'CLOSED' && field(vote, 'status') !== 'CLOSED') {
    await voteRepository.updateVoteStatus(field(vote, 'id'), 'CLOSED');
    return { ...vote, status: 'CLOSED', STATUS: 'CLOSED' };
  }

  return vote;
};

const closeVoteNow = async (voteId) => {
  await voteRepository.updateVoteStatus(voteId, 'CLOSED');
};

const getOpenOrClosedVote = async (voteId) => {
  const vote = await voteRepository.findVoteById(voteId);
  if (!vote) throw new AppError(ERROR_CODES.VOTE_40401);
  return updateVoteStatusIfDeadlinePassed(vote);
};

const ensureVoteOptionExists = async (voteId, voteOptionId) => {
  const options = await voteOptionRepository.findVoteOptionsByVoteId(voteId);
  const option = options.find(o => field(o, 'id') === voteOptionId);
  if (!option) throw new AppError(ERROR_CODES.VOTE_OPTION_40401);
};

const toCreateVoteOptions = async (roomId, options) => {
  return await Promise.all(options.map(async ({ placeId }) => {
    const place = await placeRepository.findPlaceById(placeId);
    if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
    if (field(place, 'room_id') !== roomId) throw new AppError(ERROR_CODES.VOTE_40902);
    return {
      id: randomUUID(),
      placeId,
      optionText: field(place, 'title'),
      optionDate: null,
      optionTime: null
    };
  }));
};

// --- 서비스 함수 ---

export const createVote = async ({ roomId, memberId, title, deadline, options }) => {
  await assertRoomExists(roomId);
  await assertMemberInRoom(memberId, roomId);

  if (!title) throw new AppError(ERROR_CODES.VOTE_40002);
  if (!options || options.length < 2) throw new AppError(ERROR_CODES.VOTE_40003);
  const parsedDeadline = deadline ? new Date(deadline) : null;
  if (parsedDeadline && Number.isNaN(parsedDeadline.getTime())) {
    throw new AppError(ERROR_CODES.VOTE_40004);
  }
  if (parsedDeadline && parsedDeadline <= new Date()) throw new AppError(ERROR_CODES.VOTE_40004);

  const voteId = randomUUID();
  const voteOptions = await toCreateVoteOptions(roomId, options);

  await voteRepository.createVoteWithOptions({
    vote: {
      id: voteId,
      roomId,
      createdByMemberId: memberId,
      title,
      description: null,
      voteType: 'PLACE',
      deadline: parsedDeadline,
      status: 'OPEN'
    },
    options: voteOptions
  });

  const createdVote = await voteRepository.findVoteById(voteId);
  return toVoteDto(createdVote, memberId);
};

export const getVotes = async ({ roomId, memberId }) => {
  await assertRoomExists(roomId);
  await assertMemberInRoom(memberId, roomId);

  const roomVotes = await voteRepository.findVotesByRoomId(roomId);
  const resultVotes = [];
  for (const vote of roomVotes) {
    const updatedVote = await updateVoteStatusIfDeadlinePassed(vote);
    resultVotes.push(await toVoteDto(updatedVote, memberId));
  }

  return { roomId, votes: resultVotes };
};

export const vote = async ({ voteId, memberId, voteOptionId }) => {
  const v = await getOpenOrClosedVote(voteId);
  const roomId = field(v, 'room_id');
  await assertMemberInRoom(memberId, roomId);

  if (field(v, 'status') === 'CLOSED') throw new AppError(ERROR_CODES.VOTE_RESPONSE_40901);
  await ensureVoteOptionExists(voteId, voteOptionId);

  await voteResponseRepository.upsertVoteResponseByMember({
    id: randomUUID(),
    voteId,
    voteOptionId,
    memberId
  });

  const updatedVote = await voteRepository.findVoteById(voteId);
  const dto = await toVoteDto(updatedVote, memberId);
  return {
    voteId,
    memberId,
    myVoteOptionId: voteOptionId,
    options: dto.options
  };
};

export const closeVote = async ({ voteId, memberId }) => {
  const v = await getOpenOrClosedVote(voteId);
  const roomId = field(v, 'room_id');
  await assertMemberInRoom(memberId, roomId);
  if (field(v, 'status') === 'CLOSED') throw new AppError(ERROR_CODES.VOTE_40901);

  await closeVoteNow(voteId);

  return { voteId, memberId, status: 'CLOSED' };
};

export const deleteVote = async ({ voteId, memberId }) => {
  const v = await voteRepository.findVoteById(voteId);
  if (!v) throw new AppError(ERROR_CODES.VOTE_40401);
  const roomId = field(v, 'room_id');
  await assertMemberInRoom(memberId, roomId);

  await voteRepository.deleteVoteCascadeById(voteId);

  return { voteId, memberId };
};
