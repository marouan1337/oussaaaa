"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  Search,
  Filter,
  Star,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  Waves,
  Heart,
  Eye,
  ChevronDown,
  Grid3X3,
  List,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

// Define property type
interface Property {
  _id: string;
  title: string;
  description: string;
  type: "rent" | "sell";
  location: {
    address?: string;
    city: string;
    state?: string;
    country: string;
  };
  price: {
    daily: number;
    weekly?: number;
    monthly?: number;
    currency: string;
  };
  images: { url: string; publicId: string; caption?: string }[];
  features: string[];
  amenities: string[];
  status: "available" | "rented" | "maintenance";
  availability?: {
    startDate: string;
    endDate: string;
    status: "available" | "booked" | "blocked";
  }[];
}

const amenityIcons = {
  WiFi: Wifi,
  Climatisation: Wind,
  Cuisine: Utensils,
  Parking: Car,
  Télévision: Tv,
  "Accès à la plage": Waves,
};

const cities = [
  "Toutes les villes",
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fez",
  "Agadir",
  "Tangier",
];

export default function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Toutes les villes");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("price-low");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch properties
  useEffect(() => {
    const handler = setTimeout(() => {
      async function fetchProperties() {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          params.append('type', selectedType);
          params.append('city', selectedCity === "Toutes les villes" ? "all" : selectedCity);
          params.append('search', searchTerm);
          params.append('priceMin', String(priceRange[0]));
          params.append('priceMax', String(priceRange[1]));
          if (selectedAmenities.length > 0) {
            params.append('amenities', selectedAmenities.join(','));
          }
          params.append('sortBy', sortBy);

          const response = await fetch(`/api/properties?${params.toString()}`);
          if (!response.ok) {
            throw new Error("Échec de la récupération des propriétés");
          }
          const data = await response.json();
          setProperties(data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
          setLoading(false);
        }
      }
      fetchProperties();
    }, 500); // Debounce requests

    return () => {
      clearTimeout(handler);
    };
  }, [selectedType, selectedCity, searchTerm, priceRange, selectedAmenities, sortBy]);

  const allAmenities = useMemo(() => {
    return Array.from(new Set(properties.flatMap((p) => p.amenities)));
  }, [properties]);



  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    }
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des propriétés...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Une erreur s'est produite
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <div className="flex items-center space-x-2">
              <Link
                href="/"
                className="flex items-center rounded bg-green-600 hover:bg-green-700 text-white py-3 text-lg px-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Trouvez la propriété de vos rêves</h1>
            <p className="text-lg text-gray-600 mt-2">Découvrez notre liste de propriétés soigneusement sélectionnées</p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Rechercher par nom ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Type de bien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="rent">À Louer</SelectItem>
                  <SelectItem value="sell">À Vendre</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Prix : Croissant</SelectItem>
                  <SelectItem value="price-high">Prix : Décroissant</SelectItem>
                  <SelectItem value="date-new">Date : Plus récent</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Plus de filtres
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Fourchette de prix (DH par jour)
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1500}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Équipements</label>
                    <div className="grid grid-cols-2 gap-2">
                      {allAmenities.map((amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={amenity}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={(checked) =>
                              handleAmenityChange(amenity, checked as boolean)
                            }
                          />
                          <label htmlFor={amenity} className="text-sm">
                            {amenity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{properties.length} propriétés trouvées</h2>
          <div className="text-sm text-gray-600">
            Affichage de {properties.length} propriétés
          </div>
        </div>

        {/* Properties Grid/List */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucune propriété trouvée
            </h3>
            <p className="text-gray-600">
              Essayez d'ajuster vos critères de recherche
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }
          >
            {properties.map((property) => (
              <Card
                key={property._id}
                className={`overflow-hidden hover:shadow-lg transition-shadow ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                <div className={viewMode === "list" ? "w-1/3" : "w-full"}>
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={property.images[0]?.url || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge
                        variant={
                          property.status === "available"
                            ? "default"
                            : "secondary"
                        }
                        className="text-sm font-medium"
                      >
                        {property.status === "available"
                          ? "Disponible"
                          : property.status === "rented"
                          ? "Loué"
                          : "En maintenance"}
                      </Badge>
                      {property.type && (
                        <Badge
                            className={cn(
                                "text-sm font-medium",
                                property.type === 'rent' 
                                    ? "bg-blue-100 text-blue-800 border-blue-300" 
                                    : "bg-purple-100 text-purple-800 border-purple-300"
                            )}
                            variant="outline"
                        >
                            {property.type === 'rent' ? 'À Louer' : 'À Vendre'}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      {property.price.daily ? (
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                        >
                          {formatPrice(property.price.daily)}/jour
                        </Badge>
                      ) : property.price.monthly ? (
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                        >
                          {formatPrice(property.price.monthly)}/mois
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className={viewMode === "list" ? "w-2/3" : "w-full"}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg leading-tight">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location.city}, {property.location.country}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Features */}
                      <div className="flex flex-wrap gap-1">
                        {property.features.slice(0, 3).map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                        {property.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.features.length - 3} autres
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <Button asChild className="flex-1">
                          <Link href={`/properties/${property._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les détails
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
