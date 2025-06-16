"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Define the form schema
const propertyFormSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
  type: z.enum(["rent", "sell"]),
  status: z.enum(["available", "rented", "maintenance"]),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(1, "La ville est requise"),
    state: z.string().optional(),
    country: z.string().min(1, "Le pays est requis"),
  }),
  price: z
    .object({
      daily: z.number().optional(),
      weekly: z.number().optional(),
      monthly: z.number().optional(),
      currency: z.string().default("DH"),
    })
    .refine(
      (data) => data.daily != null || data.weekly != null || data.monthly != null,
      {
        message: "Au moins un prix (journalier, hebdomadaire ou mensuel) doit être fourni.",
        path: ["daily"], // Show error on the daily field
      }
    ),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  availability: z
    .array(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        status: z.enum(["available", "booked", "blocked"]).default("available"),
      })
    )
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        publicId: z.string(),
        caption: z.string().optional(),
      })
    )
    .optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  property?: any; // The property data for editing
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [featureInput, setFeatureInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ url: string; publicId: string; caption: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageCaption, setImageCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabs = [
    "basic",
    "location",
    "pricing",
    "features",
    "availability",
    "images",
  ];
  const isLastTab = currentTab === tabs[tabs.length - 1];
  const isFirstTab = currentTab === tabs[0];

  // Initialize form with existing property data or defaults
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property
      ? {
          ...property,
          type: property.type || "rent",
          price: {
            ...property.price,
            daily: property.price?.daily || undefined,
            weekly: property.price?.weekly || undefined,
            monthly: property.price?.monthly || undefined,
          },
          availability: property.availability?.map((p: any) => ({
            ...p,
            startDate: new Date(p.startDate),
            endDate: new Date(p.endDate),
          })),
        }
      : {
          title: "",
          description: "",
          type: "rent",
          status: "available",
          location: {
            address: "",
            city: "",
            state: "",
            country: "",
          },
          price: {
            daily: undefined,
            weekly: undefined,
            monthly: undefined,
            currency: "DH",
          },
          features: [],
          amenities: [],
          availability: [],
          images: [],
        },
  });

  const {
    fields: availabilityFields,
    append: appendAvailability,
    remove: removeAvailability,
  } = useFieldArray({
    control: form.control,
    name: "availability",
  });

  // Initialize uploaded images from property data
  useEffect(() => {
    if (property?.images?.length) {
      setUploadedImages(property.images);
    }
  }, [property]);

  // Add a feature to the list
  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = form.getValues("features") || [];
      form.setValue("features", [...currentFeatures, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  // Remove a feature from the list
  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  // Add an amenity to the list
  const addAmenity = () => {
    if (amenityInput.trim()) {
      const currentAmenities = form.getValues("amenities") || [];
      form.setValue("amenities", [...currentAmenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  // Remove an amenity from the list
  const removeAmenity = (index: number) => {
    const currentAmenities = form.getValues("amenities") || [];
    form.setValue(
      "amenities",
      currentAmenities.filter((_, i) => i !== index)
    );
  };

  // Navigate to next tab
  const handleNext = () => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  // Navigate to previous tab
  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    setIsUploading(true);

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();

      // Add the uploaded image to state with caption
      const newImage = {
        url: result.secure_url,
        publicId: result.public_id,
        caption: imageCaption || "",
      };

      const newImages = [...uploadedImages, newImage];
      setUploadedImages(newImages);
      form.setValue("images", newImages);
      setImageCaption("");

      toast.success("Image téléchargée avec succès !");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
    form.setValue("images", newImages);
  };

  // Update image caption
  const updateCaption = (index: number, caption: string) => {
    const newImages = [...uploadedImages];
    newImages[index].caption = caption;
    setUploadedImages(newImages);
    form.setValue("images", newImages);
  };

  // Handle form validation errors
  const onError = (errors: any) => {
    toast.error("Veuillez corriger les erreurs avant de continuer.");
    const errorFields = Object.keys(errors) as Array<keyof PropertyFormValues>;
    if (errorFields.length > 0) {
      const firstError = errorFields[0];
      
      const fieldToTabMap: { [key in keyof PropertyFormValues]?: string } = {
        title: "basic",
        description: "basic",
        type: "basic",
        status: "basic",
        location: "location",
        price: "pricing",
        features: "features",
        amenities: "features",
        availability: "availability",
        images: "images",
      };

      const tab = fieldToTabMap[firstError];
      if (tab) {
        setCurrentTab(tab);
      }
    }
  };

  // Handle form submission
  async function onSubmit(formData: PropertyFormValues) {
    // Add the current images to the form data
    formData.images = uploadedImages;

    setIsSubmitting(true);

    try {
      const url = property
        ? `/api/properties/${property._id}`
        : "/api/properties";

      const method = property ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement de la propriété");
      }

      const result = await response.json();

      toast.success(
        property
          ? "Propriété mise à jour avec succès"
          : "Propriété créée avec succès"
      );

      // Redirect to property details or properties list
      router.push(
        property
          ? `/dashboard/properties/${result._id}`
          : "/dashboard/properties"
      );
      router.refresh();
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement de la propriété"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
            <TabsTrigger value="basic">Infos de base</TabsTrigger>
            <TabsTrigger value="location">Emplacement</TabsTrigger>
            <TabsTrigger value="pricing">Tarifs</TabsTrigger>
            <TabsTrigger value="features">Caractéristiques et équipements</TabsTrigger>
            <TabsTrigger value="availability">Disponibilité</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
                <CardDescription>
                  Saisissez les informations de base de votre propriété.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Appartement Cosy en Centre-Ville" {...field} />
                      </FormControl>
                      <FormDescription>
                        Un titre descriptif pour la propriété.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Un bel et spacieux appartement..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type de propriété" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rent">À louer</SelectItem>
                          <SelectItem value="sell">À vendre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="rented">Loué</SelectItem>
                          <SelectItem value="maintenance">En maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emplacement</CardTitle>
                <CardDescription>
                  Fournissez les détails de l'emplacement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123 Rue de la Paix" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Casablanca" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>État/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Grand Casablanca" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maroc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tarifs</CardTitle>
                <CardDescription>
                  Définissez les tarifs de votre propriété.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="price.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez la devise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DH">MAD (DH)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price.daily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix par jour</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseInt(e.target.value)
                                : undefined;
                              field.onChange(value);
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price.weekly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix par semaine</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseInt(e.target.value)
                                : undefined;
                              field.onChange(value);
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price.monthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix par mois</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                                ? parseInt(e.target.value)
                                : 0;
                              field.onChange(value);
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Features & Amenities Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques et équipements</CardTitle>
                <CardDescription>
                  Listez les caractéristiques et équipements disponibles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormLabel>Caractéristiques</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ajoutez une caractéristique..."
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                    />
                    <Button type="button" onClick={addFeature}>
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.getValues("features")?.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <FormLabel>Équipements</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ajoutez un équipement..."
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAmenity();
                        }
                      }}
                    />
                    <Button type="button" onClick={addAmenity}>
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.getValues("amenities")?.map((amenity, index) => (
                      <div
                        key={index}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{amenity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => removeAmenity(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Availability Tab */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Gérer la disponibilité</CardTitle>
                <CardDescription>
                  Ajoutez ou supprimez des périodes de location. Marquez les périodes comme réservées, disponibles ou bloquées pour maintenir votre calendrier à jour.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availabilityFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col md:flex-row gap-4 items-start p-4 border rounded-lg"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
                        <FormField
                          control={form.control}
                          name={`availability.${index}.startDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date de début</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: fr })
                                      ) : (
                                        <span>Sélectionnez une date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                    locale={fr}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`availability.${index}.endDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date de fin</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: fr })
                                      ) : (
                                        <span>Sélectionnez une date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date <
                                      new Date(
                                        form.getValues(`availability.${index}.startDate`) ||
                                          new Date()
                                      )
                                    }
                                    initialFocus
                                    locale={fr}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`availability.${index}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statut</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez le statut" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="available">Disponible</SelectItem>
                                  <SelectItem value="booked">Réservé</SelectItem>
                                  <SelectItem value="blocked">Bloqué</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeAvailability(index)}
                        className="mt-4 md:mt-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    appendAvailability({
                      startDate: new Date(),
                      endDate: new Date(),
                      status: "available",
                    });
                  }}
                  className="mt-4"
                >
                  Ajouter une période
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Téléchargez des images de votre propriété.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <FormLabel>Ajouter une image</FormLabel>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        placeholder="Légende de l'image (optionnel)"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Images téléchargées</h3>
                    {uploadedImages.length === 0 ? (
                      <div className="text-center p-8 border border-dashed rounded-md">
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Aucune image téléchargée pour le moment
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative border rounded-md overflow-hidden"
                          >
                            <div className="aspect-video relative">
                              <img
                                src={image.url}
                                alt={
                                  image.caption || `Image de la propriété ${index + 1}`
                                }
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="p-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-medium truncate">
                                  {image.caption || `Image ${index + 1}`}
                                </p>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <Input
                                placeholder="Modifier la légende"
                                value={image.caption || ""}
                                onChange={(e) =>
                                  updateCaption(index, e.target.value)
                                }
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-4">
          {!isFirstTab && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Précédent
            </Button>
          )}
          <div className="flex-1" />
          {!isLastTab ? (
            <Button type="button" onClick={handleNext}>
              Suivant
            </Button>
          ) : (
            <>
              {property && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/properties/${property._id}`)
                  }
                >
                  Annuler
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : property
                  ? "Mettre à jour la propriété"
                  : "Créer la propriété"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
