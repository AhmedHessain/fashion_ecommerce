"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupFormSchema } from "@/utils/schema";
import CustomInput from "@/Components/CustomInput";
import { Avatar, Snackbar, Alert } from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { validateImage } from "@/utils/utilFunctions";
import { updateUserData } from "@/app/actions"; // ✅ use your existing one
import { useUser } from "@/context/userContext";
import { useGlobalLoading } from "@/context/loadingContext";
import { uploadImageFromBuffer } from "@/utils/cloudinary";
import AppError from "@/backend/utils/AppError";
const AccountForm = () => {
  const { user, setUser } = useUser();
  const { setIsLoading } = useGlobalLoading();

  const [image, setImage] = useState(user?.imageUrl || undefined);
  const [warning, setWarning] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupFormSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
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
      const updates = [{ name: data.name }, { email: data.email }];

      if (image && typeof image !== "string") {
        const FormDataimage = new FormData();
        FormDataimage.append("image", image);
        const imageUrl = await uploadImageFromBuffer(FormDataimage);

        if (!imageUrl) {
          throw new AppError("Problem occured with image upload process", 500);
        }

        updates.push({ imageUrl }); // base64 or URL depending on your model
      }

      if (!image) {
        updates.push({ imageUrl: "" }); // To remove the image
      }
      const updatedUser = await updateUserData(updates);
      if (updatedUser) {
        setUser(updatedUser);
        setSuccess("Profile updated successfully!");
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while updating.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex gap-8 items-center">
        {/* Image Upload */}
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
                src={
                  typeof image === "object" ? URL.createObjectURL(image) : image
                }
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
        </div>

        <CustomInput
          name="name"
          label="Name"
          control={control}
          errors={errors}
          showError={true}
        />
      </div>
      <CustomInput
        name="email"
        label="Email"
        control={control}
        errors={errors}
        showError={true}
      />

      <button
        type="submit"
        className="bg-primary text-white rounded py-2 hover:opacity-80"
      >
        Save Changes
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

export default AccountForm;
