"use client";

import React, { useRef, useState } from "react";
import { ALLOWED_MIME, MAX_FILE_BYTES } from "@/lib/constants";
import { UploadCloudIcon } from "@/components/Icons";

interface FileDropProps {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function FileDrop({ onFileSelected, onError, disabled = false }: FileDropProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      onError("Please choose a PNG or JPG under 4 MB.");
      return;
    }
    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      onError("Please choose a PNG or JPG under 4 MB.");
      return;
    }
    onFileSelected(file);
  };

  const openPicker = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input value so re-selecting the same file fires onChange
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onClick={openPicker}
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors sm:py-10 ${
        dragging ? "border-maroon-700 bg-maroon-50" : "border-maroon-200 bg-white hover:bg-maroon-50/50"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
      <UploadCloudIcon className="h-12 w-12 text-maroon-700" />
      <p className="text-lg font-bold text-navy-900">Choose a PNG or JPG (max 4 MB)</p>
      <p className="text-sm text-navy-500">Drag and drop an image here, or use the button below.</p>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          openPicker();
        }}
        className="mt-1 min-h-11 rounded-lg bg-maroon-700 px-8 text-sm font-bold text-white hover:bg-maroon-800 disabled:cursor-not-allowed"
      >
        Choose File
      </button>
    </div>
  );
}
