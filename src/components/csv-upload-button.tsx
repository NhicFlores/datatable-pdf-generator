"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface CSVUploadButtonProps {
  onFileSelect: (file: File) => Promise<void>;
  acceptedFileTypes?: string;
  label: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

export function CSVUploadButton({
  onFileSelect,
  acceptedFileTypes = ".csv",
  label,
  variant = "outline",
  size = "default",
  disabled = false,
}: CSVUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadStatus("error");
      alert("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      await onFileSelect(file);
      setUploadStatus("success");

      // Reset success status after 3 seconds
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getIcon = () => {
    if (isUploading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (uploadStatus === "success")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (uploadStatus === "error")
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Upload className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (uploadStatus === "success") return "default";
    if (uploadStatus === "error") return "destructive";
    return variant;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled || isUploading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        variant={getButtonVariant()}
        size={size}
        className="flex items-center gap-2"
      >
        {getIcon()}
        {isUploading ? "Uploading..." : label}
      </Button>
    </>
  );
}
