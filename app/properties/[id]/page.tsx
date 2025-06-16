import { notFound } from "next/navigation";
import Image from "next/image";
import { Property as PropertyModel } from "@/lib/db/models/property";
import dbConnect from "@/lib/db/connect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ShareButtons from "@/components/ShareButtons";
import WhatsAppButton from "../../components/WhatsAppButton";
import {
  MapPin,
  MessageCircle,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  Waves,
  Calendar,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import { Document, Types } from "mongoose";
import nextDynamic from "next/dynamic";

const ImageModal = nextDynamic(() => import("@/components/ImagesModal"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"><Loader2 className="h-8 w-8 text-white animate-spin" /></div>,
});

// Define property type
interface PropertyType {
  _id: string;
  images?: { url: string; publicId: string; caption?: string }[];
  availability?: {
    startDate: string;
    endDate: string;
    status: "available" | "booked" | "blocked";
  }[];
  title: string;
  description: string;
  type: "rent" | "sell";
  status: "available" | "rented" | "maintenance";
  location?: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    currency: string;
  };
  features?: string[];
  amenities?: string[];
}

// Define types for MongoDB documents
interface MongoProperty extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: "rent" | "sell";
  images?: { url: string; publicId: string; caption?: string }[];
  price?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
    currency: string;
  };
  location?: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  features?: string[];
  amenities?: string[];
  status: "available" | "rented" | "maintenance";
  availability?: {
    startDate: Date;
    endDate: Date;
    status: "available" | "booked" | "blocked";
  }[];
}

const amenityIcons = {
  WiFi: Wifi,
  "Air Conditioning": Wind,
  Kitchen: Utensils,
  Parking: Car,
  TV: Tv,
  "Beach Access": Waves,
};

const amenityTranslations: { [key: string]: string } = {
  WiFi: "WiFi",
  "Air Conditioning": "Climatisation",
  Kitchen: "Cuisine",
  Parking: "Parking",
  TV: "Télévision",
  "Beach Access": "Accès à la plage",
};

// Fetch property data with error handling and types
async function getProperty(id: string): Promise<PropertyType | null> {
  try {
    await dbConnect();

    const property = await PropertyModel.findById(id)
      .select({
        title: 1,
        description: 1,
        type: 1,
        images: 1,
        price: 1,
        location: 1,
        features: 1,
        amenities: 1,
        status: 1,
        availability: 1,
      })
      .lean<MongoProperty>();

    if (!property) {
      return null;
    }

    // Convert Mongoose document to plain object and serialize/deserialize
    const propertyData = {
      ...property,
      _id: property._id.toString(),
      availability: property.availability?.map((period) => ({
        ...period,
        startDate: new Date(period.startDate).toISOString(),
        endDate: new Date(period.endDate).toISOString(),
      })),
    } as unknown as PropertyType;

    return propertyData;
  } catch (error) {
    console.error("Error fetching property:", error);
    throw new Error("Échec de la récupération des données de la propriété");
  }
}

// Generate static params for static generation
export async function generateStaticParams() {
  try {
    await dbConnect();
    const properties = await PropertyModel.find({}, "_id").lean();

    return properties.map((property: any) => ({
      id: property._id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Metadata generation with revalidation
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: "Propriété non trouvée",
      description: "La propriété demandée n'a pas été trouvée.",
    };
  }

  const description =
    property.description.length > 160
      ? `${property.description.substring(0, 157)}...`
      : property.description;

  return {
    title: `${property.title} | Locations au Maroc`,
    description,
    openGraph: {
      title: property.title,
      description,
      images:
        property.images && property.images.length > 0
          ? [{ url: property.images[0].url }]
          : undefined,
      type: "website",
      locale: "fr_FR",
    },
    alternates: {
      canonical: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/properties/${property._id}`,
    },
  };
}

// Loading component
function PropertyDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Error component
function PropertyError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h2 className="text-2xl font-bold text-red-600">Propriété non trouvée</h2>
      <p className="text-lg text-gray-600">
        Une erreur s'est produite lors du chargement de la propriété.
      </p>
      <p className="text-sm text-gray-500">
        Veuillez réessayer plus tard ou contacter le support.
      </p>
      <Button asChild>
        <Link href="/properties">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux propriétés
        </Link>
      </Button>
    </div>
  );
}

// Main component with proper error boundaries and loading states
export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const property = await getProperty(params.id);

    if (!property) {
      notFound();
    }

    const propertyUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/properties/${property._id}`;

    // Format price with currency
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "MAD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    };

    // Translate status to French
    const getStatusInFrench = (status: string) => {
      switch (status) {
        case "available":
          return "Disponible";
        case "rented":
          return "Loué";
        case "maintenance":
          return "En maintenance";
        default:
          return status;
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* <ImageModal
          images={property.images}
          initialIndex={0}
          isOpen={true}
          onClose={() => {}}  
        /> */}
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link
                  href="/properties"
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour aux propriétés
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <ShareButtons
                  title={property.title}
                  description={property.description}
                  propertyId={property._id}
                />
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<PropertyDetailSkeleton />}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Property Title and Location */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {property.title}
                  </h1>
                  {property.type && (
                    <Badge
                      className={`text-lg font-semibold ${
                        property.type === "sell"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {property.type === "sell" ? "À vendre" : "À louer"}
                    </Badge>
                  )}
                </div>
              </div>
              {property.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {property.location.address &&
                      `${property.location.address}, `}
                    {property.location.city && `${property.location.city}, `}
                    {property.location.country}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Images and Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery */}
                {property.images && property.images.length > 0 && (
                  <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                      <Image
                        src={property.images[0].url}
                        alt={property.images[0].caption || property.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant={
                            property.status === "available"
                              ? "default"
                              : "secondary"
                          }
                          className="text-sm font-medium"
                        >
                          {getStatusInFrench(property.status)}
                        </Badge>
                      </div>
                      {property.price?.daily && (
                        <div className="absolute top-4 right-4">
                          <Badge
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                          >
                            {formatPrice(property.price.daily)}/jour
                          </Badge>
                        </div>
                      )}
                      <Button
                        variant="secondary"
                        className="absolute bottom-4 right-4 z-10"
                        onClick={() => setShowModal(true)}
                      >
                        Voir toutes les photos
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {property.images.slice(1).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden"
                        >
                          <Image
                            src={image.url}
                            alt={image.caption || `Image ${index + 2}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>À propos de cette propriété</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Features */}
                {property.features && property.features.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Caractéristiques</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Équipements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {property.amenities.map((amenity, index) => {
                          const IconComponent =
                            amenityIcons[amenity as keyof typeof amenityIcons];
                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              {IconComponent ? (
                                <IconComponent className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                              )}
                              <span className="text-sm text-gray-700">
                                {amenityTranslations[amenity] || amenity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Booking Card */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Tarifs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Pricing */}
                      {property.price && (
                        <div className="space-y-3">
                          {property.price.daily && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                Tarif journalier
                              </span>
                              <span className="text-2xl font-bold text-green-600">
                                {formatPrice(property.price.daily)}
                              </span>
                            </div>
                          )}
                          {property.price.weekly && (
                            <>
                              <Separator />
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  Tarif hebdomadaire
                                </span>
                                <span className="text-lg font-semibold">
                                  {formatPrice(property.price.weekly)}
                                </span>
                              </div>
                            </>
                          )}
                          {property.price.monthly && (
                            <>
                              <Separator />
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  Tarif mensuel
                                </span>
                                <span className="text-lg font-semibold">
                                  {formatPrice(property.price.monthly)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <Separator />

                      {/* Availability */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-600">
                            {property.status === "available"
                              ? "Disponible maintenant"
                              : getStatusInFrench(property.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {property.status === "available"
                            ? "Cette propriété est actuellement disponible à la réservation"
                            : "Cette propriété n'est pas disponible pour le moment"}
                        </p>
                      </div>

                      <Separator />

                      {/* Contact Buttons */}
                      <div className="space-y-4">
                        <WhatsAppButton
                          title={property.title}
                          location={property.location || {}}
                          features={property.features}
                          propertyUrl={propertyUrl}
                        />
                        <p className="text-xs text-gray-500 text-center">
                          Cliquez pour envoyer un message pré-rempli avec les
                          détails de la propriété
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Contact rapide
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Obtenez des réponses instantanées sur la
                          disponibilité, les prix et les détails de réservation.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Temps de réponse:
                            </span>
                            <span className="text-green-600 font-medium">
                              Généralement sous 1 heure
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Langues:</span>
                            <span className="text-gray-700">
                              Arabe, Français, Anglais
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error loading property:", error);
    return <PropertyError />;
  }
}

// Add route segment config
export const dynamic = "force-dynamic";
export const fetchCache = "force-cache";
export const dynamicParams = true;
