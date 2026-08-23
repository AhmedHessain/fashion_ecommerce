"use client";

import React, { useState } from "react";
import { Avatar } from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { validateImage } from "@/utils/utilFunctions";
import { uploadImageFromBuffer } from "@/utils/cloudinary";

const UserEditForm = ({ record, onCancel, onSave }) => {
  const [form, setForm] = useState({
    name: record.name || "",
    email: record.email || "",
    role: record.role || "user",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(record.imageUrl || "");
  const [warning, setWarning] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        let finalImageUrl = record.imageUrl || "";
        try {
          if (imageFile) {
            const fd = new FormData();
            fd.append("image", imageFile);
            finalImageUrl = await uploadImageFromBuffer(fd);
          } else if (!imagePreview) {
            finalImageUrl = "";
          }
        } catch (err) {
          console.error(err);
          setWarning("Failed to upload image. Please try again.");
        }

        await onSave({ ...form, imageUrl: finalImageUrl });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Avatar upload */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Avatar image
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              name="image"
              accept="image/*"
              id="admin-edit-user-img"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && validateImage(file, setWarning)) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            <div className="flex relative">
              <label
                className="relative min-w-[60px] overflow-hidden rounded-[50%] group cursor-pointer self-center border"
                htmlFor="admin-edit-user-img"
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
                  src={imagePreview || undefined}
                />
                <div className="border-t-0 border-cyan-50 bg-[#BDBDBD] flex justify-center items-center absolute bottom-0 w-full overflow-hidden h-0 group-hover:h-5 group-hover:border-t transition-all">
                  <AddAPhotoIcon
                    sx={{ color: "black", width: 10, height: 10 }}
                  />
                </div>
              </label>
              {imagePreview && (
                <div
                  className="absolute top-0 left-0 bg-white rounded-[50%] flex"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                >
                  <HighlightOffIcon
                    sx={{
                      cursor: "pointer",
                      color: "black",
                      fontSize: 18,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Name</label>
          <input
            className="border rounded px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Email</label>
          <input
            type="email"
            className="border rounded px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Role</label>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="user">user</option>
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>
      {warning && <p className="text-xs text-amber-600 mt-1">{warning}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90"
        >
          Save changes
        </button>
      </div>
    </form>
  );
};

export default UserEditForm;
