import Link from "next/link";
import { Building2 } from "lucide-react";
import { Property } from "@/lib/db/models/property";
import dbConnect from "@/lib/db/connect";

async function getProperties() {
  await dbConnect();
  return Property.find({
    status: { $ne: "maintenance" },
    $or: [
      { availability: { $size: 0 } },
      {
        availability: {
          $not: {
            $elemMatch: {
              startDate: { $lte: new Date() },
              endDate: { $gte: new Date() },
              status: { $in: ["booked", "blocked"] }
            }
          }
        }
      }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(6);
}

export default async function Home() {
  const properties = await getProperties();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Property"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Trouvez votre bien idéal</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Découvrez des biens d’exception adaptés à votre style de vie. Qu’il
            s’agisse de résidences de luxe ou d’investissements stratégiques,
            nous avons ce qu’il vous faut.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg bg-background text-foreground hover:bg-secondary transition-colors"
          >
            <Building2 className="mr-2 h-5 w-5" />
            Parcourir les propriétés
          </Link>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Propriétés en vedette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property: any) => (
            <div
              key={property._id}
              className="group relative rounded-lg overflow-hidden bg-card shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="aspect-video relative">
                <img
                  src={
                    property.images[0]?.url ||
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {property.location.city}, {property.location.country}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {property?.price?.monthly >= 1 && (
                    <span className="text-l font-semibold p-1.5 px-2 bg-gray-50 max-h-fit max-w-fit rounded-lg">
                      {property.price.monthly.toFixed(2)}
                      {property.currency || "DH "}/mois
                    </span>
                  )}
                  {property?.price?.weekly >= 1 && (
                    <span className="text-l font-semibold p-1.5 px-2 bg-gray-50 max-h-fit max-w-fit rounded-lg">
                      {property.price.weekly.toFixed(2)}
                      {property.currency || "DH "}/Semaine
                    </span>
                  )}
                  {property?.price?.daily >= 1 && (
                    <span className="text-l font-semibold p-1.5 px-2 bg-gray-50 max-h-fit max-w-fit rounded-lg">
                      {property.price.daily.toFixed(2)}
                      {property.currency || "DH "}/Jour
                    </span>
                  )}
                  <Link
                    href={`/properties/${property._id}`}
                    className="inline-flex items-center px-4 py-2 text-center rounded-md bg-primary text-primary-foreground max-w-fit hover:bg-primary/90 transition-colors"
                  >
                    Voir les détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
