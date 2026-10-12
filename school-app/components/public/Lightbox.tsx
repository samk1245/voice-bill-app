'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: { src: string; caption?: string; title?: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !images.length) return null;

  const current = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 select-none">
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close image lightbox"
        className="absolute top-5 right-5 z-50 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Image and Caption */}
      <div
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.title || current.caption || 'School photograph'}
          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
        />
        {(current.title || current.caption) && (
          <div className="mt-4 text-center text-white px-4 py-2 bg-black/60 rounded-lg max-w-xl">
            {current.title && <h4 className="font-semibold text-base">{current.title}</h4>}
            {current.caption && <p className="text-sm text-gray-300 mt-1">{current.caption}</p>}
          </div>
        )}
        <span className="text-xs text-gray-400 mt-2">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
