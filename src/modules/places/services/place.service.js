export const getPlanner = async ({ roomId, memberId }) => {
  return {
    room: {
      roomId,
      name: '제주도 힐링 여행',
      startDate: '2026-04-06',
      endDate: '2026-04-08'
    },
    days: [],
    scheduleItems: [],
    places: []
  };
};

export const createPlace = async ({
  roomId,
  memberId,
  title,
  sourceUrl,
  memo,
  estimatedCost
}) => {
  return {
    roomId,
    memberId,
    placeId: 'place-uuid',
    title,
    sourceUrl,
    memo,
    estimatedCost,
    isRequired: false,
    isScheduled: false
  };
};

export const updatePlace = async ({
  placeId,
  memberId,
  title,
  sourceUrl,
  memo,
  estimatedCost,
  isRequired
}) => {
  return {
    placeId,
    memberId,
    title,
    sourceUrl,
    memo,
    estimatedCost,
    isRequired
  };
};

export const deletePlace = async ({ placeId, memberId }) => {
  return {
    placeId,
    memberId
  };
};

export const updatePlaceReaction = async ({
  placeId,
  memberId,
  reactionType
}) => {
  return {
    placeId,
    memberId,
    myReaction: reactionType,
    reactionSummary: {
      likeCount: 1,
      dislikeCount: 0,
      commentCount: 0
    }
  };
};

export const updatePlaceRequired = async ({
  placeId,
  memberId,
  isRequired
}) => {
  return {
    placeId,
    memberId,
    isRequired
  };
};

export const getPlaceComments = async ({ placeId, memberId }) => {
  return {
    placeId,
    comments: []
  };
};

export const createPlaceComment = async ({
  placeId,
  memberId,
  content
}) => {
  return {
    commentId: 'comment-uuid',
    placeId,
    memberId,
    content,
    createdAt: new Date().toISOString()
  };
};

export const createScheduleItem = async ({
  roomId,
  memberId,
  placeId,
  title,
  date,
  startTime,
  endTime,
  memo
}) => {
  return {
    scheduleItemId: 'schedule-item-uuid',
    roomId,
    memberId,
    placeId: placeId ?? null,
    title: title ?? '장소 일정',
    date,
    startTime,
    endTime,
    memo: memo ?? null
  };
};

export const deleteScheduleItem = async ({ scheduleItemId, memberId }) => {
  return {
    scheduleItemId,
    memberId
  };
};