"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "@/utils/schema";
import CustomInput from "@/Components/CustomInput";
import { login } from "../actions";
import GoogleProvider from "@/Components/Google Provider";
import { useGlobalLoading } from "@/context/loadingContext";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
const LoginForm = ({ nextAuthError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser } = useUser();
  const [error, setError] = useState("");
  const { setIsLoading } = useGlobalLoading();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    mode: "onSubmit",
  });
  const router = useRouter();
  useEffect(() => {
    setUser(null);
  }, [setUser]);
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const res = await login(formData);
      if (res.ok) {
        router.push("/");
        setUser(res.user);
        setError("");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err);
    }
    setIsLoading(false);
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
  }, [setIsLoading, errors]);
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
          showSuccess={false}
        />
        <CustomInput
          name="password"
          label="Password"
          control={control}
          errors={errors}
          type="password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showSuccess={false}
        />
        <button className="bg-primary px-12 h-[50px] rounded text-white text-l w-full hover:bg-primary hover:bg-opacity-75 mt-2">
          Sign in
        </button>
        {error && <p className="text-red-400 w-[400px] h-64]">{error}</p>}
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
      <GoogleProvider
        setIsLoading={setIsLoading}
        text={`Login with Google`}
        callbackUrl="/login"
        nextAuthError={nextAuthError}
      />
      {/* {(isSubmitting || isLoading) && <CircularLoading />} */}
    </>
  );
};

export default LoginForm;
