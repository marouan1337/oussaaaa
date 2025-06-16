import { notFound } from "next/navigation";
import { Property } from "@/lib/db/models/property";
import dbConnect from "@/lib/db/connect";
import PropertyForm from "@/components/PropertyForm";

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

export default async function EditPropertyPage({
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
      <h1 className="text-3xl font-bold">Modifier la propriété</h1>
      <PropertyForm property={property} />
    </div>
  );
}
