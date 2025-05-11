"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupFormSchema } from "@/utils/schema";
import { Avatar } from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import Box from "@mui/material/Box";
import Link from "next/link";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CustomInput from "../../Components/CustomInput";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { passwordCriteria } from "@/utils/criteria";
import { validateImage } from "@/utils/utilFunctions";
import { signup } from "../actions";
import GoogleProvider from "@/Components/Google Provider";
import { useGlobalLoading } from "@/context/loadingContext";

const SignUpForm = () => {
  const { setIsLoading } = useGlobalLoading();
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState("");
  const [warning, setWarning] = useState(false);
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupFormSchema),
    mode: "all", // Validate on every change
  });
  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file, setWarning)) {
      setImage(file);
    }
  };
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("image", image);
      const error = await signup(formData);
      if (error) {
        setError(error.message);
      } else {
        setError("");
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <div className="flex gap-5 items-center">
          <input
            type="file"
            name="image"
            accept="image/*"
            id="img"
            className="hidden"
            onChange={onImageChange}
          />
          <div className="flex relative">
            <label
              className="relative min-w-[60px] overflow-hidden rounded-[50%] group cursor-pointer self-center border"
              htmlFor="img"
            >
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                }}
                imgProps={{
                  style: {
                    objectPosition: "top",
                  },
                }}
                src={image ? URL.createObjectURL(image) : undefined}
              />
              <div className="border-t-0 border-cyan-50 bg-[#BDBDBD] flex justify-center items-center absolute bottom-0 w-full overflow-hidden h-0 group-hover:h-5 group-hover:border-t transition-all">
                <AddAPhotoIcon sx={{ color: "black", width: 10, height: 10 }} />
              </div>
            </label>
            {image && (
              <div
                className="absolute top-0 left-0 bg-white rounded-[50%] flex"
                onClick={() => {
                  setImage("");
                }}
              >
                <HighlightOffIcon
                  sx={{ cursor: "pointer", color: "black", fontSize: 18 }}
                />
              </div>
            )}
          </div>
          <div className="self-start">
            <h1 className="text-xl">Create an account</h1>
            <p>Enter your details below</p>
          </div>
        </div>

        <CustomInput
          name="name"
          label="Name"
          control={control}
          errors={errors}
          showError
        />

        {/* Custom Input for Email */}
        <CustomInput
          name="email"
          label="Email"
          control={control}
          errors={errors}
          showError
        />

        {/* Custom Input for Password with Validation */}
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
        <button
          type="submit"
          className="bg-primary px-12 h-[50px] rounded text-white text-l w-full hover:bg-primary hover:bg-opacity-75 mt-2"
        >
          Create Account
        </button>
        {error && <p className="text-red-400">{error}</p>}
        <p className="text-primary">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Login
          </Link>
        </p>
      </Box>
      {warning && (
        <Snackbar
          open={warning}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() => {
            setWarning("");
          }}
        >
          <Alert severity="warning" variant="filled" sx={{ width: "100%" }}>
            {warning}
          </Alert>
        </Snackbar>
      )}
      <GoogleProvider
        setIsLoading={setIsLoading}
        text={`Sign up with Google`}
        callbackUrl="/register"
      />
    </>
  );
};

export default SignUpForm;
