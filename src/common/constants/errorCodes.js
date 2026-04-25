export const ERROR_CODES = {
  // ROOM
  ROOM_40001: {
    status: 400,
    code: 'ROOM_40001',
    message: '잘못된 방 생성 요청입니다.'
  },
  ROOM_40002: {
    status: 400,
    code: 'ROOM_40002',
    message: '시작일이 종료일보다 늦을 수 없습니다.'
  },
  ROOM_40401: {
    status: 404,
    code: 'ROOM_40401',
    message: '존재하지 않는 방입니다.'
  },

  // MEMBER
  MEMBER_40001: {
    status: 400,
    code: 'MEMBER_40001',
    message: '잘못된 멤버 요청입니다.'
  },
  MEMBER_40101: {
    status: 401,
    code: 'MEMBER_40101',
    message: '이름 또는 비밀번호가 올바르지 않습니다.'
  },
  MEMBER_40301: {
    status: 403,
    code: 'MEMBER_40301',
    message: '방 소속 멤버가 아닙니다.'
  },
  MEMBER_40901: {
    status: 409,
    code: 'MEMBER_40901',
    message: '같은 방에 이미 존재하는 이름입니다.'
  },

  // INVITE
  INVITE_40401: {
    status: 404,
    code: 'INVITE_40401',
    message: '존재하지 않는 초대 링크입니다.'
  },
  INVITE_41001: {
    status: 410,
    code: 'INVITE_41001',
    message: '만료되었거나 유효하지 않은 초대 링크입니다.'
  },

  // PLACE
  PLACE_40001: {
    status: 400,
    code: 'PLACE_40001',
    message: '잘못된 장소 요청입니다.'
  },
  PLACE_40002: {
    status: 400,
    code: 'PLACE_40002',
    message: '장소 이름은 필수입니다.'
  },
  PLACE_40003: {
    status: 400,
    code: 'PLACE_40003',
    message: '링크가 없거나 형식이 올바르지 않습니다.'
  },
  PLACE_40401: {
    status: 404,
    code: 'PLACE_40401',
    message: '존재하지 않는 장소입니다.'
  },
  PLACE_40901: {
    status: 409,
    code: 'PLACE_40901',
    message: '확정된 장소는 수정/삭제/반응 변경이 불가능합니다.'
  },

  // REACTION
  REACTION_40001: {
    status: 400,
    code: 'REACTION_40001',
    message: '잘못된 반응 타입입니다.'
  },

  // COMMENT
  COMMENT_40001: {
    status: 400,
    code: 'COMMENT_40001',
    message: '댓글 내용은 필수입니다.'
  },
  COMMENT_40401: {
    status: 404,
    code: 'COMMENT_40401',
    message: '존재하지 않는 댓글입니다.'
  },

  // ITINERARY
  ITINERARY_40001: {
    status: 400,
    code: 'ITINERARY_40001',
    message: '잘못된 일정 요청입니다.'
  },
  ITINERARY_40401: {
    status: 404,
    code: 'ITINERARY_40401',
    message: '존재하지 않는 일정 일자입니다.'
  },
  ITINERARY_40402: {
    status: 404,
    code: 'ITINERARY_40402',
    message: '존재하지 않는 일정 아이템입니다.'
  },
  ITINERARY_40901: {
    status: 409,
    code: 'ITINERARY_40901',
    message: '동일 시간대 일정이 이미 존재합니다.'
  },

  // VOTE
  VOTE_40001: {
    status: 400,
    code: 'VOTE_40001',
    message: '잘못된 투표 생성 요청입니다.'
  },
  VOTE_40002: {
    status: 400,
    code: 'VOTE_40002',
    message: '투표 제목은 필수입니다.'
  },
  VOTE_40003: {
    status: 400,
    code: 'VOTE_40003',
    message: '선택지는 최소 2개 이상이어야 합니다.'
  },
  VOTE_40004: {
    status: 400,
    code: 'VOTE_40004',
    message: '마감 시간은 현재보다 이후여야 합니다.'
  },
  VOTE_40401: {
    status: 404,
    code: 'VOTE_40401',
    message: '존재하지 않는 투표입니다.'
  },
  VOTE_40901: {
    status: 409,
    code: 'VOTE_40901',
    message: '이미 마감된 투표입니다.'
  },
  VOTE_40902: {
    status: 409,
    code: 'VOTE_40902',
    message: '같은 방에 속하지 않는 장소는 선택지로 사용할 수 없습니다.'
  },

  // VOTE OPTION
  VOTE_OPTION_40401: {
    status: 404,
    code: 'VOTE_OPTION_40401',
    message: '존재하지 않는 선택지입니다.'
  },

  // VOTE RESPONSE
  VOTE_RESPONSE_40001: {
    status: 400,
    code: 'VOTE_RESPONSE_40001',
    message: '잘못된 투표 참여 요청입니다.'
  },
  VOTE_RESPONSE_40901: {
    status: 409,
    code: 'VOTE_RESPONSE_40901',
    message: '마감된 투표에는 참여할 수 없습니다.'
  }
};