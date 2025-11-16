"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/utils/schema";
import CustomInput from "@/Components/CustomInput";
import { passwordCriteria } from "@/utils/criteria";
import { Snackbar, Alert } from "@mui/material";
import { changePassword } from "@/app/actions"; // Your password update logic
import { useGlobalLoading } from "@/context/loadingContext";

const ChangePasswordForm = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { setIsLoading } = useGlobalLoading();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data) => {
    console.log("Submitting data:", data);
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("currentPassword", data.currentPassword);
      formData.append("newPassword", data.newPassword);
      const res = await changePassword(formData);

      if (res.ok) {
        setSuccess("Password changed successfully!");
        setError("");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <CustomInput
        name="currentPassword"
        label="Current Password"
        control={control}
        errors={errors}
        type="password"
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showSuccess={false}
      />
      <CustomInput
        name="newPassword"
        label="New Password"
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
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />
      <button
        type="submit"
        className="bg-primary text-white rounded py-2 hover:opacity-80"
      >
        Change Password
      </button>

      {error && <p className="text-red-400">{error}</p>}

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </form>
  );
};

export default ChangePasswordForm;
