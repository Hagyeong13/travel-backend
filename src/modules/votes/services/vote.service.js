export const createVote = async ({
  roomId,
  memberId,
  title,
  deadline,
  options
}) => {
  return {
    voteId: 'vote-uuid',
    roomId,
    memberId,
    title,
    deadline: deadline ?? null,
    status: 'OPEN',
    options: options ?? []
  };
};

export const getVotes = async ({ roomId, memberId }) => {
  return {
    roomId,
    votes: []
  };
};

export const vote = async ({
  voteId,
  memberId,
  voteOptionId
}) => {
  return {
    voteId,
    memberId,
    myVoteOptionId: voteOptionId,
    options: []
  };
};

export const closeVote = async ({ voteId, memberId }) => {
  return {
    voteId,
    memberId,
    status: 'CLOSED'
  };
};

export const deleteVote = async ({ voteId, memberId }) => {
  return {
    voteId,
    memberId
  };
};