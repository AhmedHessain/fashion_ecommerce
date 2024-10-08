"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "@/utils/schema";
import CustomInput from "@/Components/CustomInput";
import CircularLoading from "@/Components/Loader";
import { login } from "../actions";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const error = await login(formData);
      if (error) {
        setError(error.message);
      } else {
        setError("");
      }
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    // fake request if there are validation errors
    if (Object.keys(errors).length !== 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setError("Email or password is incorrect");
      }, 3000);
    }
  }, [errors]);
  return (
    <>
      <Box
        component="form"
        action={handleSubmit(onSubmit)}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <div className="self-start">
          <h1 className="text-xl ">Login</h1>
          <p>Enter your details below</p>
        </div>
        <CustomInput
          name="email"
          label="Email"
          control={control}
          errors={errors}
        />
        <CustomInput
          name="password"
          label="Password"
          control={control}
          errors={errors}
          type="password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
        <button className="bg-primary px-12 h-[50px] rounded text-white text-l w-full hover:bg-primary hover:bg-opacity-75 mt-2">
          Sign in
        </button>
        {error && <p className="text-red-400">{error}</p>}
        <Link className="text-primary underline w-fit" href="/forget-password">
          Forget Password?{" "}
        </Link>
        <p className="text-primary">
          Don&apos;t have an account?{" "}
          <Link className="underline" href="/register" disabled={isSubmitting}>
            Sign Up
          </Link>
        </p>
      </Box>
      {(isSubmitting || isLoading) && <CircularLoading />}
    </>
  );
};

export default LoginForm;
