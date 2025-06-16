"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DeletePropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la suppression de la propriété");
      }

      toast.success("Propriété supprimée avec succès");
      router.push("/dashboard/properties");
      router.refresh();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error(
        error instanceof Error ? error.message : "Échec de la suppression de la propriété"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="border-destructive">
        <CardHeader className="bg-destructive/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Supprimer la propriété</CardTitle>
          </div>
          <CardDescription>
            Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p>
            La suppression de cette propriété la retirera définitivement du système.
            Toutes les données associées seront également supprimées.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href={`/dashboard/properties/${params.id}`}>
            <Button variant="outline">Annuler</Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Suppression..." : "Supprimer la propriété"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
