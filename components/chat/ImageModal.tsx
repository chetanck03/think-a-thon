'use client';

import { X, Download } from 'lucide-react';
import { useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, fileName }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <a
        href={imageUrl}
        download={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-16 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="w-6 h-6" />
      </a>

      <div
        className="max-w-7xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={fileName}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
        <p className="text-white text-center mt-4 text-sm">{fileName}</p>
      </div>
    </div>
  );
}
