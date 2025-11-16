import { NextResponse } from "next/server";
import AppError from "./AppError";

const handleCastErrorDB = (err) => {
  return new AppError(`${err.value} is not a valid id.`, 400);
};

const handleValidationErrorDB = (err) => {
  const message = [];
  Object.keys(err.errors).forEach((field) => {
    message.push(`${err.errors[field].message}`);
  });
  return new AppError(message, 400);
};

const handleDuplicateKeyErrorDB = (err) => {
  const errors = [];
  Object.keys(err.keyValue).forEach((field) => {
    errors.push(`{ ${field}: ${err.keyValue[field]} }`);
  });
  // const message = `Duplicate Field Values: ${errors.join(",")}.`;
  const message = `The email is already connected to an account`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError("Invalid or expired token.", 401);
};

const sendErrorDev = (err) => {
  return NextResponse.json(
    {
      status: err.status,
      message: err.message,
      stack: err.stack,
      err,
    },
    { status: err.status }
  );
};

const sendErrorProd = (err) => {
  return NextResponse.json(
    {
      status: "Internal Server Error",
      message: "Error occured in server.",
    },
    { status: 500 }
  );
};

const sendError = (err) => {
  if (err.operational) {
    return NextResponse.json(
      {
        status: err.status,
        message: err.message,
      },
      { status: err.status }
    );
  } else if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err);
  } else if (process.env.NODE_ENV === "production") {
    return sendErrorProd(err);
  }
};

const handleError = (err) => {
  err.state = err.state || "Internal Server Error";
  err.status = err.status || 500;
  if (err.name === "CastError") {
    err = handleCastErrorDB(err);
  } else if (err.name === "ValidationError") {
    err = handleValidationErrorDB(err);
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    err = handleJWTError();
  } else if (err.code === 11000) {
    err = handleDuplicateKeyErrorDB(err);
  }

  return err;
};

const handleCatch = (unhandledCatch) => {
  if (unhandledCatch.message === "NEXT_REDIRECT") {
    throw unhandledCatch;
  }
  return handleError(unhandledCatch);
};

export const handleServerActionCatch = (unhandledServerActionCatch) => {
  const err = handleCatch(unhandledServerActionCatch);
  console.error("Server Action Error:", err);
  return {
    state: err.state,
    status: err.status,
    ok: false,
    message: err.message,
  };
};

export const handleMiddlewareError = (unhandledMiddlewareCatch) => {
  const err = handleError(unhandledMiddlewareCatch);
  console.log(err);
  return sendError(err);
};
