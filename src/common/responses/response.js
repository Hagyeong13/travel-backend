export const successResponse = (data = null, message = '요청이 성공했습니다.') => {
  return {
    success: true,
    code: 'OK',
    message,
    data
  };
};

export const failResponse = (errorCode) => {
  return {
    success: false,
    code: errorCode.code,
    message: errorCode.message,
    data: null
  };
};