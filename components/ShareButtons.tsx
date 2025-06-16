"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Share2, Check, Copy, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonsProps {
  title: string;
  description: string;
  propertyId: string;
}

export default function ShareButtons({
  title,
  description,
  propertyId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("212600000000"); // A safe default
  const [isShareApiAvailable, setIsShareApiAvailable] = useState(false);

  useEffect(() => {
    // This check ensures the code runs only on the client side
    if (typeof navigator.share === "function") {
      setIsShareApiAvailable(true);
    }

    async function fetchContactInfo() {
      try {
        const response = await fetch("/api/contact-info");
        if (response.ok) {
          const data = await response.json();
          if (data.whatsappNumber) {
            setWhatsappNumber(data.whatsappNumber);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
        // The default number will be used
      }
    }
    fetchContactInfo();
  }, []);

  // Calculate URLs
  const url =
    typeof window !== "undefined"
      ? window.location.href
      : `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/properties/${propertyId}`;

  const whatsappMessage = `Découvrez cette propriété : ${title}\n\n${description.substring(
    0,
    100
  )}...\n\n${url}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  // Handle share action
  const handleShare = () => {
    navigator
      .share({
        title: title,
        text: description.substring(0, 100) + "...",
        url: url,
      })
      .catch((error) => {
        console.error("Error sharing:", error);
      });
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      {/* Share button */}
      {isShareApiAvailable ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="share-button"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Partager la propriété</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleCopyToClipboard}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* WhatsApp button */}
      <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Contacter via WhatsApp</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>
    </div>
  );
}
