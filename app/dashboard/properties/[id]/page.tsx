import Link from "next/link";
import { notFound } from "next/navigation";
import { Property } from "@/lib/db/models/property";
import dbConnect from "@/lib/db/connect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowLeft } from "lucide-react";

async function getProperty(id: string) {
  await dbConnect();
  try {
    const property = await Property.findById(id).lean();
    if (!property) {
      return null;
    }

    // Convert Mongoose document to plain object and serialize ObjectId
    return JSON.parse(
      JSON.stringify({
        ...property,
        _id: property._id.toString(),
      })
    );
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{property.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/properties/${property._id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
          <Link href={`/dashboard/properties/${property._id}/delete`}>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Détails de la propriété</CardTitle>
            <CardDescription>
              Consultez les informations complètes sur cette propriété.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Statut
              </h3>
              <Badge
                variant={
                  property.status === "available"
                    ? "success"
                    : property.status === "rented"
                    ? "outline"
                    : "destructive"
                }
              >
                {property.status}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Description
              </h3>
              <p className="mt-1">{property.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Emplacement
              </h3>
              <p className="mt-1">
                {property.location?.address && (
                  <>{property.location.address}, </>
                )}
                {property.location?.city && <>{property.location.city}, </>}
                {property.location?.state && <>{property.location.state}, </>}
                {property.location?.country}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Tarifs
              </h3>
              <ul className="mt-1 space-y-1">
                {property.price?.daily && (
                  <li>
                    Journalier : {property.price.currency} {property.price.daily}
                  </li>
                )}
                {property.price?.weekly && (
                  <li>
                    Hebdomadaire : {property.price.currency} {property.price.weekly}
                  </li>
                )}
                {property.price?.monthly && (
                  <li>
                    Mensuel : {property.price.currency} {property.price.monthly}
                  </li>
                )}
              </ul>
            </div>

            {property.features && property.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Caractéristiques
                </h3>
                <ul className="mt-1 list-disc list-inside">
                  {property.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Équipements
                </h3>
                <ul className="mt-1 list-disc list-inside">
                  {property.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            {property.images && property.images.length > 0 ? (
              <div className="space-y-2">
                {property.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video relative bg-muted rounded-md overflow-hidden"
                  >
                    {/* In a real app, you would use Next.js Image component */}
                    <img
                      src={image.url}
                      alt={image.caption || `Property image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune image disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
