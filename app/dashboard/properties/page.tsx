import Link from "next/link";
import { Property } from "@/lib/db/models/property";
import dbConnect from "@/lib/db/connect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

type PropertyType = {
  _id: string;
  title: string;
  type: "rent" | "sell";
  status: "available" | "rented" | "maintenance";
  location?: {
    city?: string;
    country?: string;
  };
  price?: {
    monthly?: number;
    currency?: string;
  };
  availability?: Array<{
    startDate: string;
    endDate: string;
    status: "available" | "booked" | "blocked";
  }>;
};

const determinePropertyStatus = (
  property: PropertyType
): "available" | "rented" | "maintenance" => {
  if (property.status === "maintenance") {
    return "maintenance";
  }

  const now = new Date();
  const isRentedNow = property.availability?.some(
    (period) =>
      period.status === "booked" &&
      new Date(period.startDate) <= now &&
      new Date(period.endDate) >= now
  );

  if (isRentedNow) {
    return "rented";
  }

  return "available";
};

async function getProperties(): Promise<PropertyType[]> {
  await dbConnect();
  const propertiesFromDb = await Property.find().sort({ createdAt: -1 }).lean();

  // Manually map to ensure the object shape matches PropertyType, especially for dates.
  return (propertiesFromDb as any[]).map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    type: p.type,
    status: p.status,
    location: p.location,
    price: p.price,
    availability: p.availability?.map(
      (a: { startDate: Date; endDate: Date; status: any }) => ({
        ...a,
        startDate: a.startDate.toISOString(),
        endDate: a.endDate.toISOString(),
      })
    ),
  }));
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Propriétés</h1>
        <Link href="/dashboard/properties/insert">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une propriété
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gérer les propriétés</CardTitle>
          <CardDescription>
            Consultez et gérez toutes vos annonces immobilières.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Prix (Mensuel)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucune propriété trouvée. Ajoutez votre première propriété !
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property) => {
                  const dynamicStatus = determinePropertyStatus(property);
                  return (
                    <TableRow key={property._id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/properties/${property._id}`}
                          className="hover:underline"
                        >
                          {property.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {property.location?.city}, {property.location?.country}
                      </TableCell>
                      <TableCell>
                        {property.type === "sell" ? (
                          <Badge variant="secondary">À vendre</Badge>
                        ) : (
                          <Badge variant="default">À louer</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {dynamicStatus === "available" ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Disponible
                          </Badge>
                        ) : dynamicStatus === "maintenance" ? (
                          <Badge className="bg-orange-500 hover:bg-orange-600">
                            En maintenance
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500 hover:bg-red-600">
                            Loué
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {property.price?.monthly
                          ? `${property.price.currency || "$"} ${
                              property.price.monthly
                            }`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/properties/${property._id}/edit`}
                          >
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Modifier</span>
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/properties/${property._id}/delete`}
                          >
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
