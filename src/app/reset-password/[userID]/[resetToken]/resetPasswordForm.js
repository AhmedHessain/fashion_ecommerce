"use client";
import { useState } from "react";
import React from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/utils/schema";
import CustomInput from "@/Components/CustomInput";
import CircularLoading from "@/Components/Loader";
import { passwordCriteria } from "@/utils/criteria";
import { resetPassword } from "@/app/actions";
import CheckIcon from "@mui/icons-material/Check";
import Link from "next/link";
const ResetPasswordForm = ({ userID, resetToken }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "all",
  });

  const onSubmit = async (data) => {
    try {
      console.log("asdasd");
      const formData = new FormData();
      formData.append("password", data.password);
      formData.append("userID", userID);
      formData.append("resetToken", resetToken);
      const error = await resetPassword(formData);

      if (error) {
        setError("Invalid or expired reset token");
      } else {
        setError("");
        setIsPasswordChanged(true);
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Box
      className="flex items-center justify-center h-screen bg-gray-50 flex-1 "
      component="form"
      action={handleSubmit(onSubmit)}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        {isSubmitting ? <CircularLoading /> : null}
        {isPasswordChanged ? (
          <>
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="flex w-14 h-14 border rounded-[50%] justify-center items-center">
                <CheckIcon sx={{ fontSize: 40, color: "green" }} />
              </div>
              <p>Your password has been successsfully reset</p>
              <Link
                className="text-primary w-fit text-center hover:underline"
                href="/login"
              >
                Go to login
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-center mb-4 text-l">
              Reset Password
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Enter your new password below
            </p>
            <div>
              <div className="mb-3 flex flex-col gap-4">
                <CustomInput
                  name="password"
                  label="Password"
                  control={control}
                  errors={errors}
                  type="password"
                  showError
                  criteria={passwordCriteria} // Pass password criteria
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
                <CustomInput
                  name="confirmPassword"
                  label="Confirm Password"
                  control={control}
                  errors={errors}
                  type="password"
                  showError
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                />
              </div>
              <button
                type="submit"
                className={`bg-primary px-12 h-[50px] rounded text-white text-l w-full hover:bg-primary hover:bg-opacity-75 mt-2`}
                disabled={isSubmitting}
              >
                Submit
              </button>
              {error && <p className="text-red-400">{error}</p>}
            </div>
          </>
        )}
      </div>
    </Box>
  );
};

export default ResetPasswordForm;
