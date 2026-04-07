export const getSettings = async ({ roomId, memberId }) => {
  return {
    members: [],
    invite: {
      token: 'abc123xyz',
      inviteUrl: 'http://localhost:3000/invite/abc123xyz'
    },
    room: {
      roomId,
      name: '제주도 힐링 여행',
      startDate: '2026-04-06',
      endDate: '2026-04-08',
      createdAt: new Date().toISOString()
    }
  };
};