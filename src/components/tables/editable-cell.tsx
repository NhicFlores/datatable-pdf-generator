"use client";

import { Input } from "../ui/input";
import { useState, useEffect } from "react";

interface EditableCellProps {
  value: string | number | undefined;
  onUpdate: (value: string | number) => void;
  type?: "text" | "number" | "date";
  className?: string;
  placeholder?: string;
  step?: string;
  min?: string;
  isMatched?: boolean;
  disabled?: boolean;
  autoEdit?: boolean; // Auto-edit when value meets condition
  autoEditCondition?: (value: string | number) => boolean;
  zeroValueText?: string; // Custom text for zero/empty values
  zeroValueStyle?: string; // Custom styling for zero/empty values
}

export function EditableCell({
  value,
  onUpdate,
  type = "text",
  className = "",
  placeholder,
  step,
  min,
  isMatched = false,
  disabled = false,
  autoEdit = false,
  autoEditCondition,
  zeroValueText,
  zeroValueStyle = "",
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState(() => {
    return value?.toString() ?? "";
  });
  const [isEditing, setIsEditing] = useState(() => {
    if (autoEdit && autoEditCondition && value !== undefined) {
      return autoEditCondition(value);
    }
    return autoEdit && type === "number" && value === 0;
  });

  useEffect(() => {
    setLocalValue(value?.toString() ?? "");
  }, [value]);

  const handleBlur = () => {
    let processedValue: string | number = localValue;

    if (type === "number") {
      processedValue = parseFloat(localValue) || 0;
    }

    onUpdate(processedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
    if (e.key === "Escape") {
      setLocalValue(value?.toString() ?? "");
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <Input
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`h-8 text-sm ${className}`}
        placeholder={placeholder}
        step={step}
        min={min}
        autoFocus
      />
    );
  }

  const displayValue =
    type === "number" && typeof value === "number" ? value.toFixed(2) : value;

  // Handle special zero value display
  const shouldShowZeroText = type === "number" && value === 0 && zeroValueText;
  const displayText = shouldShowZeroText
    ? zeroValueText
    : displayValue || placeholder || "-";

  const cellClassName = `
    block px-2 py-1 cursor-pointer hover:bg-gray-100 rounded
    ${isMatched ? "text-green-600 font-semibold" : ""}
    ${disabled ? "cursor-not-allowed opacity-50" : ""}
    ${shouldShowZeroText ? `text-red-500 font-semibold ${zeroValueStyle}` : ""}
    ${className}
  `.trim();

  return (
    <span
      className={cellClassName}
      onClick={handleClick}
      title={disabled ? "" : "Click to edit"}
    >
      {displayText}
    </span>
  );
}
