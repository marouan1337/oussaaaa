import { Card } from "@/components/ui/card";
import { Property } from "@/lib/db/models/property";
import dbConnect from "@/lib/db/connect";
import { Building2, Home, Users } from "lucide-react";

async function getDashboardStats() {
  await dbConnect();

  const totalProperties = await Property.countDocuments();
  const availableProperties = await Property.countDocuments({
    status: "available",
  });
  const rentedProperties = await Property.countDocuments({ status: "rented" });

  return {
    totalProperties,
    availableProperties,
    rentedProperties,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total des propriétés</p>
              <h3 className="text-2xl font-bold">{stats.totalProperties}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disponibles</p>
              <h3 className="text-2xl font-bold">
                {stats.availableProperties}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Louées</p>
              <h3 className="text-2xl font-bold">{stats.rentedProperties}</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
