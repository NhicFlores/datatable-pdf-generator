"use client";

import { Input } from "../ui/input";
import { useState, useEffect } from "react";

interface EditableGallonsCellProps {
  value: number;
  transactionId: string;
  onUpdate: (transactionId: string, gallons: number) => void;
  isMatched: boolean;
}

export function EditableGallonsCell({ 
  value, 
  transactionId, 
  onUpdate, 
  isMatched 
}: EditableGallonsCellProps) {
  const [gallons, setGallons] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(value === 0); // Auto-edit if gallons is 0

  useEffect(() => {
    setGallons(value.toString());
  }, [value]);

  const handleBlur = () => {
    const numericValue = parseFloat(gallons) || 0;
    onUpdate(transactionId, numericValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setGallons(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={gallons}
        onChange={(e) => setGallons(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-20 h-8 text-sm"
        placeholder="0.0"
        step="0.01"
        min="0"
        autoFocus
      />
    );
  }

  return (
    <span 
      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded ${
        isMatched ? "text-green-600 font-semibold" : ""
      } ${value === 0 ? "text-red-500 font-semibold" : ""}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit gallons"
    >
      {value === 0 ? "Enter gallons" : value.toFixed(2)}
    </span>
  );
}
