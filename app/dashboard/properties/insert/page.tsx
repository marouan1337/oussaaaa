"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import PropertyForm from "@/components/PropertyForm";

export default function AddPropertyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Property</h1>
      <PropertyForm />
    </div>
  );
}
