"use client";

import React, { useState } from "react";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { validateImage } from "@/utils/utilFunctions";
import { uploadImageFromBuffer } from "@/utils/cloudinary";

const ProductEditForm = ({ record, onCancel, onSave }) => {
  const [form, setForm] = useState({
    name: record.name || "",
    price: record.price || 0,
    quantity: record.quantity || 0,
    category: record.category || "",
    mainImage: record.mainImage || "",
    description: record.description || "",
    tags:
      Array.isArray(record.tags) && record.tags.length > 0
        ? record.tags.join(", ")
        : "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(record.mainImage || "");
  const [warning, setWarning] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        let finalMainImage = form.mainImage || record.mainImage || "";
        try {
          if (imageFile) {
            const fd = new FormData();
            fd.append("image", imageFile);
            finalMainImage = await uploadImageFromBuffer(fd);
          } else if (!imagePreview) {
            finalMainImage = "";
          }
        } catch (err) {
          console.error(err);
          setWarning("Failed to upload image. Please try again.");
        }

        onSave({
          name: form.name,
          price: Number(form.price),
          quantity: Number(form.quantity),
          category: form.category,
          mainImage: finalMainImage,
          description: form.description,
          tags: form.tags
            ? form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : undefined,
        });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Name</label>
          <input
            className="border rounded px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Category</label>
          <input
            className="border rounded px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Main image
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              name="image"
              accept="image/*"
              id="admin-edit-product-img"
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
                className="relative w-16 h-16 overflow-hidden rounded-md group cursor-pointer self-center border"
                htmlFor="admin-edit-product-img"
              >
                <img
                  src={imagePreview || form.mainImage || ""}
                  alt={form.name}
                  className="w-full h-full object-cover"
                />
                <div className="border-t-0 border-cyan-50 bg-[#BDBDBD] flex justify-center items-center absolute bottom-0 w-full overflow-hidden h-0 group-hover:h-5 group-hover:border-t transition-all">
                  <AddAPhotoIcon
                    sx={{ color: "black", width: 10, height: 10 }}
                  />
                </div>
              </label>
              {(imagePreview || form.mainImage) && (
                <div
                  className="absolute -top-1 -right-1 bg-white rounded-full flex"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    setForm((p) => ({ ...p, mainImage: "" }));
                  }}
                >
                  <HighlightOffIcon
                    sx={{ cursor: "pointer", color: "black", fontSize: 16 }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Tags (comma separated)
          </label>
          <input
            className="border rounded px-3 py-2 text-sm"
            value={form.tags}
            onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Description
          </label>
          <textarea
            rows={3}
            className="border rounded px-3 py-2 text-sm resize-none"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Price</label>
          <input
            type="number"
            step="0.01"
            className="border rounded px-3 py-2 text-sm"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Quantity</label>
          <input
            type="number"
            className="border rounded px-3 py-2 text-sm"
            value={form.quantity}
            onChange={(e) =>
              setForm((p) => ({ ...p, quantity: e.target.value }))
            }
          />
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

export default ProductEditForm;


