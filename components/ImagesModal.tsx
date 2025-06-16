"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface ImageData {
  url: string;
  publicId: string;
  caption?: string;
}

interface ImageModalProps {
  images: ImageData[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initial index when modal opens or initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      goToPrevious();
    } else if (event.key === "ArrowRight") {
      goToNext();
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 text-white hover:bg-white/20"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <Image
              src={currentImage.url || "/placeholder.svg"}
              alt={currentImage.caption || `Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 text-white hover:bg-white/20"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Image counter and caption */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
            {images.length > 1 && (
              <div className="text-white/80 text-sm mb-2">
                {currentIndex + 1} / {images.length}
              </div>
            )}
            {currentImage.caption && (
              <div className="text-white bg-black/50 px-4 py-2 rounded-lg max-w-md">
                {currentImage.caption}
              </div>
            )}
          </div>

          {/* Thumbnail indicators */}
          {images.length > 1 && images.length <= 10 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-white" : "bg-white/40"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
