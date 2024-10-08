"use client";
import { useState } from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgetPasswordSchema } from "@/utils/schema";
import CustomInput from "@/Components/CustomInput";
import Link from "next/link";
import CheckIcon from "@mui/icons-material/Check";
import CircularLoading from "@/Components/Loader";
import { forgetPassword } from "../actions";
const ForgetPassword = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgetPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);

      const error = await forgetPassword(formData);

      if (error && error.status != 404) {
        setError(error.message);
      } else {
        setError("");
        setIsEmailSent(true);
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
        {isEmailSent ? (
          <div className="flex flex-col justify-center items-center gap-5">
            <div className="flex w-14 h-14 border rounded-[50%] justify-center items-center">
              <CheckIcon sx={{ fontSize: 40, color: "green" }} />
            </div>
            <p>
              A password reset link has been sent to the email provided, if
              applicable
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-center mb-4 text-l">
              Forgot Password
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Enter your email to reset your password
            </p>
            <div>
              <div className="mb-3">
                <CustomInput
                  name="email"
                  label="Email"
                  control={control}
                  errors={errors}
                />
              </div>
              <button
                type="submit"
                className={`bg-primary px-12 h-[50px] rounded text-white text-l w-full hover:bg-primary hover:bg-opacity-75 mt-2`}
                disabled={isSubmitting}
              >
                Send email
              </button>
              {error && <p className="text-red-400">{error}</p>}
              {errors?.email && (
                <p className="text-red-400">{errors.email.message}</p>
              )}
            </div>
          </>
        )}
        <div className="mt-2 text-center">
          <Link className="text-primary w-fit hover:underline" href="/login">
            Go back to login
          </Link>
        </div>
      </div>
    </Box>
  );
};

export default ForgetPassword;
