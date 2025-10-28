import React, { useRef, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  preventAccidentalClose?: boolean;
  confirmMessage?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  children, 
  preventAccidentalClose = false,
  confirmMessage = "Are you sure you want to close? Any unsaved changes will be lost."
}) => {
  const isSelectingRef = useRef(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleBackdropMouseDown = useCallback((e: React.MouseEvent) => {
    // Check if there's any text selection when mouse is pressed
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      isSelectingRef.current = true;
      return;
    }
    
    // Only close if clicking directly on the backdrop (not on modal content)
    if (e.target === e.currentTarget) {
      isSelectingRef.current = false;
    }
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Don't close if user was selecting text
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }
    
    // Only close if clicking directly on the backdrop (not on modal content)
    if (e.target === e.currentTarget) {
      if (preventAccidentalClose) {
        const confirmed = window.confirm(confirmMessage);
        if (confirmed) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  }, [onClose, preventAccidentalClose, confirmMessage]);

  // Reset selection flag when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      isSelectingRef.current = false;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg mx-4 sm:mx-6 md:mx-auto sm:rounded-lg bg-card text-card-foreground shadow-lg p-4 sm:p-6 transition-all animate-in fade-in zoom-in"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;