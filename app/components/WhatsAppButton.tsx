"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface WhatsAppButtonProps {
  title: string;
  location: {
    city?: string;
    country?: string;
    address?: string;
  };
  features?: string[];
  propertyUrl: string;
}

export default function WhatsAppButton({
  title,
  location,
  features,
  propertyUrl,
}: WhatsAppButtonProps) {
  const [whatsappNumber, setWhatsappNumber] = useState("212600000000"); // A safe default

  useEffect(() => {
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

  const generateMessage = () => {
    const message = `Bonjour! Je suis intéressé par "${title}" situé à ${
      location.city
    }, ${location.country}. 

📍 Adresse: ${location.address}
🏠 Caractéristiques: ${features?.slice(0, 3).join(", ")}

Lien de la propriété: ${propertyUrl}

Pouvez-vous me donner plus d'informations sur la disponibilité et la réservation ?`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Link
      href={generateMessage()}
      target="_blank"
      className="w-full flex items-center justify-center rounded bg-green-600 hover:bg-green-700 text-white py-3 text-lg px-4"
    >
      <MessageCircle className="h-5 w-5 mr-2" />
      Contacter par WhatsApp
    </Link>
  );
}
