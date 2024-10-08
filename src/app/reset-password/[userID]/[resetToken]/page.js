import React from "react";
import ResetPasswordForm from "./resetPasswordForm";
import { validateResetToken } from "@/backend/controller/authController";
import ResetPasswordError from "./ResetPasswordError";

const ResetPassword = async ({ params }) => {
  const { userID, resetToken } = params;
  try {
    await validateResetToken(userID, resetToken);
    return <ResetPasswordForm userID={userID} resetToken={resetToken} />;
  } catch (err) {
    return <ResetPasswordError />;
  }
};

export default ResetPassword;
