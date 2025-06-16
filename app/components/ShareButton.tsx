"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        console.log("Link copied to clipboard");
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="ghost"
      size="sm"
      className="bg-white hover:bg-gray-100"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
