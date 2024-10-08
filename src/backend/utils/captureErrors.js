import { handleServerActionCatch, handleMiddlewareError } from "./handleErrors";

export const catchAsyncServerActions = (asyncFunc) => {
  return (formData) => asyncFunc(formData).catch(handleServerActionCatch);
};

export const catchAsync = (asyncFunc) => {
  return (req, event, next) => {
    return asyncFunc(req, event, next).catch(handleMiddlewareError);
  };
};
