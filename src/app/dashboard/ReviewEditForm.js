"use client";

import React, { useState } from "react";

const ReviewEditForm = ({ record, onCancel, onSave }) => {
  const [form, setForm] = useState({
    rating: record.rating || 0,
    review: record.review || "",
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          rating: Number(form.rating),
          review: form.review,
        });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Product</label>
          <div className="px-3 py-2 text-sm border rounded bg-gray-50 text-gray-700">
            {record.product?.name || "Unknown product"}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">User</label>
          <div className="px-3 py-2 text-sm border rounded bg-gray-50 text-gray-700">
            {record.user?.name || "Unknown user"}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Rating</label>
          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            className="border rounded px-3 py-2 text-sm"
            value={form.rating}
            onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-xs font-medium text-gray-600">
            Review text
          </label>
          <textarea
            rows={3}
            className="border rounded px-3 py-2 text-sm resize-none"
            value={form.review}
            onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))}
          />
        </div>
      </div>
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

export default ReviewEditForm;


