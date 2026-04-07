export const createRoom = async ({
  name,
  startDate,
  endDate,
  totalBudget,
  hostName,
  hostPassword
}) => {
  return {
    roomId: 'room-uuid',
    memberId: 'member-uuid',
    name,
    startDate,
    endDate,
    totalBudget: totalBudget ?? null,
    hostName,
    inviteToken: 'abc123xyz'
  };
};

export const enterRoom = async ({ token, name, password }) => {
  return {
    roomId: 'room-uuid',
    memberId: 'member-uuid',
    name,
    role: 'MEMBER',
    token
  };
};

export const getRoomSummary = async ({ roomId }) => {
  return {
    roomId,
    name: '제주도 힐링 여행',
    startDate: '2026-04-06',
    endDate: '2026-04-08'
  };
};