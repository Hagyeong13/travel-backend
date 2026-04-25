import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { randomUUID } from 'crypto';
import { field, toBoolean, toDateString, toDateTimeString } from '../../../common/utils/dto.js';
import { roomRepository, memberRepository } from '../../rooms/repositories/index.js';
import {
  placeRepository,
  placeReactionRepository,
  placeCommentRepository,
  itineraryDayRepository,
  itineraryItemRepository
} from '../repositories/index.js';

const assertMemberInRoom = async (memberId, roomId) => {
  const member = await memberRepository.findMemberById(memberId);
  if (!member || field(member, 'room_id') !== roomId) {
    throw new AppError(ERROR_CODES.MEMBER_40301);
  }
};

const assertRoomExists = async (roomId) => {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);
  return room;
};

const getReactionSummary = async (placeId) => {
  const reactionSummary = await placeReactionRepository.findReactionSummaryByPlaceId(placeId);
  const commentSummary = await placeCommentRepository.countCommentsByPlaceId(placeId);

  return {
    likeCount: Number(field(reactionSummary, 'like_count') ?? 0),
    dislikeCount: Number(field(reactionSummary, 'dislike_count') ?? 0),
    commentCount: Number(field(commentSummary, 'comment_count') ?? 0)
  };
};

const isPlaceScheduled = async (placeId) => {
  const items = await itineraryItemRepository.findItineraryItemsByPlaceId(placeId);
  return items.length > 0;
};

const hasTimeOverlap = async (itineraryDayId, startTime, endTime) => {
  const dayItems = await itineraryItemRepository.findItineraryItemsByDayId(itineraryDayId);
  for (const item of dayItems) {
    const itemStartTime = field(item, 'start_time');
    const itemEndTime = field(item, 'end_time');
    if (!itemStartTime || !itemEndTime) continue;
    if (startTime < itemEndTime && itemStartTime < endTime) return true;
  }
  return false;
};

const inferSourceType = (sourceUrl) => {
  if (!sourceUrl) return 'ETC';

  const normalizedUrl = sourceUrl.toLowerCase();
  if (normalizedUrl.includes('instagram.com')) return 'INSTAGRAM';
  if (normalizedUrl.includes('map.naver.com')) return 'NAVER_MAP';
  if (normalizedUrl.includes('google.com/maps') || normalizedUrl.includes('goo.gl/maps')) {
    return 'GOOGLE_MAP';
  }

  return 'ETC';
};

/* 날짜 문자열 안전 처리 함수 */
const parseLocalDateString = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDaysToDateString = (dateStr, daysToAdd) => {
  const date = parseLocalDateString(dateStr);
  date.setDate(date.getDate() + daysToAdd);
  return formatLocalDate(date);
};

const getDiffDays = (startDateStr, endDateStr) => {
  const start = parseLocalDateString(startDateStr);
  const end = parseLocalDateString(endDateStr);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
};

const getDayOrder = (startDateStr, targetDateStr) => {
  return getDiffDays(startDateStr, targetDateStr) + 1;
};

// --- 서비스 함수 ---

export const getPlanner = async ({ roomId, memberId }) => {
  const room = await assertRoomExists(roomId);
  await assertMemberInRoom(memberId, roomId);

  const roomPlaces = await placeRepository.findPlannerPlacesByRoomId({ roomId, memberId });
  const roomPlaceDtos = roomPlaces.map((place) => ({
    placeId: field(place, 'id'),
    roomId: field(place, 'room_id'),
    memberId: field(place, 'added_by_member_id'),
    title: field(place, 'title'),
    sourceUrl: field(place, 'source_url'),
    memo: field(place, 'memo'),
    estimatedCost: field(place, 'estimated_cost'),
    isRequired: toBoolean(field(place, 'is_required')),
    isScheduled: toBoolean(field(place, 'is_scheduled')),
    reactionSummary: {
      likeCount: Number(field(place, 'like_count') ?? 0),
      dislikeCount: Number(field(place, 'dislike_count') ?? 0),
      commentCount: Number(field(place, 'comment_count') ?? 0)
    },
    myReaction: field(place, 'my_reaction') ?? null
  }));

  const roomScheduleItems = (await itineraryItemRepository.findItineraryItemsByRoomId(roomId)).map((item) => ({
    scheduleItemId: field(item, 'id'),
    roomId,
    memberId: field(item, 'member_id'),
    placeId: field(item, 'place_id'),
    title: field(item, 'title'),
    date: toDateString(field(item, 'travel_date')),
    startTime: field(item, 'start_time'),
    endTime: field(item, 'end_time'),
    memo: field(item, 'memo')
  }));

  const roomStartDate = toDateString(field(room, 'start_date'));
  const roomEndDate = toDateString(field(room, 'end_date'));

  const days = [];
  const diffDays = getDiffDays(roomStartDate, roomEndDate);

  for (let i = 0; i <= diffDays; i += 1) {
    const dateStr = addDaysToDateString(roomStartDate, i);
    days.push({
      date: dateStr,
      scheduleItems: roomScheduleItems.filter((s) => s.date === dateStr)
    });
  }

  return {
    room: {
      roomId: field(room, 'id'),
      name: field(room, 'name'),
      startDate: roomStartDate,
      endDate: roomEndDate
    },
    days,
    scheduleItems: roomScheduleItems,
    places: roomPlaceDtos
  };
};

export const createPlace = async ({ roomId, memberId, title, sourceUrl, memo, estimatedCost }) => {
  await assertRoomExists(roomId);
  await assertMemberInRoom(memberId, roomId);
  if (!title || !sourceUrl) throw new AppError(ERROR_CODES.PLACE_40002);

  const placeId = randomUUID();
  await placeRepository.createPlace({
    id: placeId,
    roomId,
    addedByMemberId: memberId,
    title,
    sourceType: inferSourceType(sourceUrl),
    sourceUrl: sourceUrl ?? null,
    address: null,
    memo: memo ?? null,
    estimatedCost: estimatedCost ?? null,
    isRequired: false
  });

  return {
    roomId,
    memberId,
    placeId,
    title,
    sourceUrl: sourceUrl ?? null,
    memo: memo ?? null,
    estimatedCost: estimatedCost ?? null,
    isRequired: false,
    isScheduled: false
  };
};

export const updatePlace = async ({ placeId, memberId, title, sourceUrl, memo, estimatedCost, isRequired }) => {
  const place = await placeRepository.findPlaceById(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);

  if (await isPlaceScheduled(placeId)) throw new AppError(ERROR_CODES.PLACE_40901);

  await placeRepository.updatePlaceById({
    id: placeId,
    title,
    sourceUrl,
    memo,
    estimatedCost,
    isRequired
  });

  const updatedPlace = await placeRepository.findPlaceById(placeId);
  const updatedIsRequired = toBoolean(field(updatedPlace, 'is_required'));

  return {
    placeId,
    memberId,
    title: field(updatedPlace, 'title'),
    sourceUrl: field(updatedPlace, 'source_url'),
    memo: field(updatedPlace, 'memo'),
    estimatedCost: field(updatedPlace, 'estimated_cost'),
    isRequired: updatedIsRequired
  };
};

export const deletePlace = async ({ placeId, memberId }) => {
  const place = await placeRepository.findPlaceById(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);

  if (await isPlaceScheduled(placeId)) throw new AppError(ERROR_CODES.PLACE_40901);

  await placeReactionRepository.deleteReactionsByPlaceId(placeId);
  await placeCommentRepository.deleteCommentsByPlaceId(placeId);
  await placeRepository.deletePlaceById(placeId);

  return { placeId, memberId };
};

export const updatePlaceReaction = async ({ placeId, memberId, reactionType }) => {
  const place = await placeRepository.findPlaceById(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
  if (await isPlaceScheduled(placeId)) throw new AppError(ERROR_CODES.PLACE_40901);
  if (!['LIKE', 'DISLIKE', 'NONE'].includes(reactionType)) throw new AppError(ERROR_CODES.REACTION_40001);

  const isClearRequest = reactionType === 'NONE';
  const newReaction = isClearRequest ? null : reactionType;

  await placeReactionRepository.upsertPlaceReaction({
    id: randomUUID(),
    placeId,
    memberId,
    reactionType: newReaction ?? 'NONE'
  });

  return {
    placeId,
    memberId,
    myReaction: newReaction,
    reactionSummary: await getReactionSummary(placeId)
  };
};

export const updatePlaceRequired = async ({ placeId, memberId, isRequired }) => {
  const place = await placeRepository.findPlaceById(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
  if (await isPlaceScheduled(placeId)) throw new AppError(ERROR_CODES.PLACE_40901);

  await placeRepository.updatePlaceRequiredById({ id: placeId, isRequired });

  return { placeId, memberId, isRequired: toBoolean(isRequired) };
};

export const getPlaceComments = async ({ placeId, memberId }) => {
  const place = await placeRepository.findPlaceById(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);

  const placeComments = await placeCommentRepository.findCommentsByPlaceId(placeId);

  return {
    placeId,
    comments: placeComments.map((comment) => ({
      commentId: field(comment, 'id'),
      placeId: field(comment, 'place_id'),
      memberId: field(comment, 'member_id'),
      memberName: field(comment, 'member_name'),
      content: field(comment, 'content'),
      createdAt: toDateTimeString(field(comment, 'created_at'))
    }))
  };
};

export const createPlaceComment = async ({ placeId, memberId, content }) => {
  const place = await placeRepository.findPlaceById(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
  if (await isPlaceScheduled(placeId)) throw new AppError(ERROR_CODES.PLACE_40901);
  if (!content || content.trim() === '') throw new AppError(ERROR_CODES.COMMENT_40001);

  const commentId = randomUUID();
  const createdAt = toDateTimeString(new Date());

  await placeCommentRepository.createPlaceComment({
    id: commentId,
    placeId,
    memberId,
    content
  });

  return { commentId, placeId, memberId, content, createdAt };
};

export const createScheduleItem = async ({ roomId, memberId, placeId, title, date, startTime, endTime, memo }) => {
  const room = await assertRoomExists(roomId);
  await assertMemberInRoom(memberId, roomId);

  const roomStartDate = toDateString(field(room, 'start_date'));
  const roomEndDate = toDateString(field(room, 'end_date'));

  if (date < roomStartDate || date > roomEndDate) {
    throw new AppError(ERROR_CODES.ITINERARY_40001);
  }

  let itineraryDay = await itineraryDayRepository.findItineraryDayByRoomAndDate({
    roomId,
    travelDate: date
  });

  if (!itineraryDay) {
    const dayOrder = getDayOrder(roomStartDate, date);

    await itineraryDayRepository.createItineraryDay({
      id: randomUUID(),
      roomId,
      travelDate: date,
      dayOrder
    });

    itineraryDay = await itineraryDayRepository.findItineraryDayByRoomAndDate({
      roomId,
      travelDate: date
    });
  }

  const itineraryDayId = field(itineraryDay, 'id');

  if (await hasTimeOverlap(itineraryDayId, startTime, endTime)) {
    throw new AppError(ERROR_CODES.ITINERARY_40901);
  }

  let resolvedTitle = title ?? '일반 일정';

  if (placeId) {
    const place = await placeRepository.findPlaceById(placeId);
    if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
    resolvedTitle = title ?? field(place, 'title');
  }

  const dayItems = await itineraryItemRepository.findItineraryItemsByDayId(itineraryDayId);
  const sequenceNo = dayItems.length + 1;
  const scheduleItemId = randomUUID();

  await itineraryItemRepository.createItineraryItem({
    id: scheduleItemId,
    itineraryDayId,
    placeId: placeId ?? null,
    title: resolvedTitle,
    startTime,
    endTime,
    sequenceNo,
    memo: memo ?? null
  });

  return {
    scheduleItemId,
    roomId,
    memberId,
    placeId: placeId ?? null,
    title: resolvedTitle,
    date,
    startTime,
    endTime,
    memo: memo ?? null
  };
};

export const deleteScheduleItem = async ({ scheduleItemId, memberId }) => {
  const item = await itineraryItemRepository.findItineraryItemById(scheduleItemId);
  if (!item) throw new AppError(ERROR_CODES.ITINERARY_40402);

  await itineraryItemRepository.deleteItineraryItemById(scheduleItemId);

  return { scheduleItemId, memberId };
};