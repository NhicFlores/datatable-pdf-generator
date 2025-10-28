"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { US_STATES, isUSState } from "@/lib/constants/states";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface StateAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function StateAutocomplete({
  value,
  onChange,
  placeholder = "Type to search states...",
  disabled = false,
}: StateAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStates, setFilteredStates] = useState<readonly string[]>(US_STATES);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter states based on input value
  useEffect(() => {
    if (!value) {
      setFilteredStates(US_STATES);
    } else {
      const filtered = US_STATES.filter(state =>
        state.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStates(filtered);
      setHighlightedIndex(-1);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleStateSelect = (state: string) => {
    onChange(state);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredStates.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredStates.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredStates.length) {
          handleStateSelect(filteredStates[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  // Helper function to highlight matching text
  const highlightMatch = (state: string, searchValue: string) => {
    if (!searchValue) return state;
    
    const index = state.toLowerCase().indexOf(searchValue.toLowerCase());
    if (index === -1) return state;
    
    const before = state.slice(0, index);
    const match = state.slice(index, index + searchValue.length);
    const after = state.slice(index + searchValue.length);
    
    return (
      <>
        {before}
        <span className="font-semibold bg-primary/10 text-primary px-0.5 rounded">
          {match}
        </span>
        {after}
      </>
    );
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  // Check if current value is a valid state
  const isValidState = isUSState(value);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${isValidState ? "border-green-500 focus:border-green-500" : ""}`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {isValidState ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredStates.length > 0 ? (
            filteredStates.map((state, index) => (
              <button
                key={state}
                type="button"
                onClick={() => handleStateSelect(state)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none ${
                  index === highlightedIndex ? "bg-accent text-accent-foreground" : ""
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {highlightMatch(state, value)}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-muted-foreground text-sm">
              No states found matching &quot;{value}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}