export class AppError extends Error {
  constructor(errorCode) {
    super(errorCode.message);
    this.name = 'AppError';
    this.status = errorCode.status;
    this.code = errorCode.code;
  }
}