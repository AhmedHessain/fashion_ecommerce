class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.state =
      status >= 400 && status <= 500 ? "Fail" : "Internal Server Error";

    this.operational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
