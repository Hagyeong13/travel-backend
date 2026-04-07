export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'AppError') {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      data: null
    });
  }

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.',
    data: null
  });
};