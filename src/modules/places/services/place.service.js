import { AppError } from '../../../common/errors/AppError.js';
import { ERROR_CODES } from '../../../common/constants/errorCodes.js';
import { randomUUID } from 'crypto';
import { rooms, members } from '../../rooms/services/room.service.js';

// In-memory stores (D파트에서 DB로 교체 예정)
export const places = new Map(); // placeId -> place
const reactions = new Map();     // `${placeId}:${memberId}` -> 'LIKE' | 'DISLIKE'
const comments = new Map();      // commentId -> comment
const scheduleItems = new Map(); // scheduleItemId -> scheduleItem

// --- 내부 헬퍼 ---

const validateMember = (memberId, roomId) => {
  const member = members.get(memberId);
  if (!member || member.roomId !== roomId) {
    throw new AppError(ERROR_CODES.MEMBER_40301);
  }
  return member;
};

const getReactionSummary = (placeId) => {
  let likeCount = 0;
  let dislikeCount = 0;
  for (const [key, type] of reactions.entries()) {
    if (key.startsWith(`${placeId}:`)) {
      if (type === 'LIKE') likeCount++;
      else if (type === 'DISLIKE') dislikeCount++;
    }
  }
  const commentCount = [...comments.values()].filter(c => c.placeId === placeId).length;
  return { likeCount, dislikeCount, commentCount };
};

const hasTimeOverlap = (roomId, date, startTime, endTime, excludeId = null) => {
  for (const item of scheduleItems.values()) {
    if (item.roomId !== roomId || item.date !== date) continue;
    if (excludeId && item.scheduleItemId === excludeId) continue;
    // 겹침 조건: startTime1 < endTime2 AND startTime2 < endTime1
    if (startTime < item.endTime && item.startTime < endTime) return true;
  }
  return false;
};

// --- 서비스 함수 ---

export const getPlanner = async ({ roomId, memberId }) => {
  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);
  validateMember(memberId, roomId);

  const roomPlaces = [...places.values()]
    .filter(p => p.roomId === roomId)
    .map(p => ({
      ...p,
      reactionSummary: getReactionSummary(p.placeId),
      myReaction: reactions.get(`${p.placeId}:${memberId}`) ?? null
    }));

  const roomScheduleItems = [...scheduleItems.values()]
    .filter(s => s.roomId === roomId)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

  // 날짜 범위로 days 배열 생성
  const days = [];
  const start = new Date(room.startDate);
  const end = new Date(room.endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      scheduleItems: roomScheduleItems.filter(s => s.date === dateStr)
    });
  }

  return {
    room: {
      roomId: room.roomId,
      name: room.name,
      startDate: room.startDate,
      endDate: room.endDate
    },
    days,
    scheduleItems: roomScheduleItems,
    places: roomPlaces
  };
};

export const createPlace = async ({ roomId, memberId, title, sourceUrl, memo, estimatedCost }) => {
  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);
  validateMember(memberId, roomId);
  if (!title) throw new AppError(ERROR_CODES.PLACE_40002);

  const placeId = randomUUID();
  const place = {
    placeId,
    roomId,
    memberId,
    title,
    sourceUrl: sourceUrl ?? null,
    memo: memo ?? null,
    estimatedCost: estimatedCost ?? null,
    isRequired: false,
    isScheduled: false,
    createdAt: new Date().toISOString()
  };
  places.set(placeId, place);

  return {
    roomId,
    memberId,
    placeId,
    title,
    sourceUrl: place.sourceUrl,
    memo: place.memo,
    estimatedCost: place.estimatedCost,
    isRequired: false,
    isScheduled: false
  };
};

export const updatePlace = async ({ placeId, memberId, title, sourceUrl, memo, estimatedCost, isRequired }) => {
  const place = places.get(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);

  // 일정에 반영된 장소는 수정 불가
  if (place.isScheduled) throw new AppError(ERROR_CODES.PLACE_40901);

  if (title !== undefined) place.title = title;
  if (sourceUrl !== undefined) place.sourceUrl = sourceUrl;
  if (memo !== undefined) place.memo = memo;
  if (estimatedCost !== undefined) place.estimatedCost = estimatedCost;
  if (isRequired !== undefined) place.isRequired = isRequired;

  return {
    placeId,
    memberId,
    title: place.title,
    sourceUrl: place.sourceUrl,
    memo: place.memo,
    estimatedCost: place.estimatedCost,
    isRequired: place.isRequired
  };
};

export const deletePlace = async ({ placeId, memberId }) => {
  const place = places.get(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);

  // 일정에 반영된 장소는 삭제 불가
  if (place.isScheduled) throw new AppError(ERROR_CODES.PLACE_40901);

  places.delete(placeId);

  // 연관 반응, 댓글 정리
  for (const key of reactions.keys()) {
    if (key.startsWith(`${placeId}:`)) reactions.delete(key);
  }
  for (const [cid, c] of comments.entries()) {
    if (c.placeId === placeId) comments.delete(cid);
  }

  return { placeId, memberId };
};

export const updatePlaceReaction = async ({ placeId, memberId, reactionType }) => {
  const place = places.get(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
  if (place.isScheduled) throw new AppError(ERROR_CODES.PLACE_40901);
  if (!['LIKE', 'DISLIKE'].includes(reactionType)) throw new AppError(ERROR_CODES.REACTION_40001);

  const key = `${placeId}:${memberId}`;
  const current = reactions.get(key) ?? null;

  // 동일 반응 재클릭 시 취소 (토글)
  const newReaction = current === reactionType ? null : reactionType;
  if (newReaction === null) {
    reactions.delete(key);
  } else {
    reactions.set(key, newReaction);
  }

  return {
    placeId,
    memberId,
    myReaction: newReaction,
    reactionSummary: getReactionSummary(placeId)
  };
};

export const updatePlaceRequired = async ({ placeId, memberId, isRequired }) => {
  const place = places.get(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
  if (place.isScheduled) throw new AppError(ERROR_CODES.PLACE_40901);

  place.isRequired = isRequired;

  return { placeId, memberId, isRequired };
};

export const getPlaceComments = async ({ placeId, memberId }) => {
  const place = places.get(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);

  const placeComments = [...comments.values()]
    .filter(c => c.placeId === placeId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return { placeId, comments: placeComments };
};

export const createPlaceComment = async ({ placeId, memberId, content }) => {
  const place = places.get(placeId);
  if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
  if (place.isScheduled) throw new AppError(ERROR_CODES.PLACE_40901);
  if (!content || content.trim() === '') throw new AppError(ERROR_CODES.COMMENT_40001);

  const commentId = randomUUID();
  const comment = {
    commentId,
    placeId,
    memberId,
    content,
    createdAt: new Date().toISOString()
  };
  comments.set(commentId, comment);

  return { commentId, placeId, memberId, content, createdAt: comment.createdAt };
};

export const createScheduleItem = async ({ roomId, memberId, placeId, title, date, startTime, endTime, memo }) => {
  const room = rooms.get(roomId);
  if (!room) throw new AppError(ERROR_CODES.ROOM_40401);
  validateMember(memberId, roomId);

  // 날짜가 방 기간 내인지 검증
  if (date < room.startDate || date > room.endDate) {
    throw new AppError(ERROR_CODES.ITINERARY_40001);
  }

  // 동일 시간대 일정 중복 체크
  if (hasTimeOverlap(roomId, date, startTime, endTime)) {
    throw new AppError(ERROR_CODES.ITINERARY_40901);
  }

  let resolvedTitle = title ?? '일반 일정';

  // 장소 연결 시 isScheduled 처리
  if (placeId) {
    const place = places.get(placeId);
    if (!place) throw new AppError(ERROR_CODES.PLACE_40401);
    resolvedTitle = title ?? place.title;
    place.isScheduled = true;
  }

  const scheduleItemId = randomUUID();
  const item = {
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
  scheduleItems.set(scheduleItemId, item);

  return item;
};

export const deleteScheduleItem = async ({ scheduleItemId, memberId }) => {
  const item = scheduleItems.get(scheduleItemId);
  if (!item) throw new AppError(ERROR_CODES.ITINERARY_40402);

  // 연결된 장소의 isScheduled 복원 (같은 placeId를 참조하는 다른 일정이 없을 때만)
  if (item.placeId) {
    const place = places.get(item.placeId);
    if (place) {
      const stillReferenced = [...scheduleItems.values()].some(
        s => s.placeId === item.placeId && s.scheduleItemId !== scheduleItemId
      );
      if (!stillReferenced) place.isScheduled = false;
    }
  }

  scheduleItems.delete(scheduleItemId);

  return { scheduleItemId, memberId };
};
