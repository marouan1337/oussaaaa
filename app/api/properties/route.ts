import { NextResponse } from "next/server";
import { Property } from "@/lib/db/models/property";
import dbConnect from "@/lib/db/connect";
import { getSession } from "@/lib/auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    console.log("API Route: Received search params:", Object.fromEntries(searchParams.entries()));

    const pipeline: any[] = [];
    
    // Text search must be the first stage
    if (searchParams.has("search") && searchParams.get("search")) {
      pipeline.push({ $match: { $text: { $search: searchParams.get("search") } } });
    }

    const initialMatchStage: any = {};
    // Type filter
    // Type filter
    if (searchParams.has("type") && searchParams.get("type") !== "all") {
      initialMatchStage.type = searchParams.get("type");
    }
    // City filter
    if (searchParams.has("city") && searchParams.get("city") !== "all") {
      initialMatchStage["location.city"] = searchParams.get("city");
    }
    // Amenities filter
    const amenities = searchParams.get("amenities");
    if (amenities) {
      initialMatchStage.amenities = { $all: amenities.split(',') };
    }
    console.log("API Route: Constructed initialMatchStage:", initialMatchStage);

    // Add initial match stage if not empty
    if (Object.keys(initialMatchStage).length > 0) {
      pipeline.push({ $match: initialMatchStage });
    }

    // Add price normalization field, defaulting to 0 if no price is set
    pipeline.push({
      $addFields: {
        normalizedDailyPrice: {
          $ifNull: [
            { $ifNull: ["$price.daily", { $divide: ["$price.monthly", 30] }] },
            0
          ]
        }
      }
    });

    // Add price match stage
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    if (priceMin && priceMax) {
      pipeline.push({
        $match: {
          normalizedDailyPrice: { $gte: Number(priceMin), $lte: Number(priceMax) }
        }
      });
    }

    // Sorting
    const sortBy = searchParams.get("sortBy") || "price-low";
    let sortStage: any = {};
    switch (sortBy) {
      case "price-low":
        sortStage = { normalizedDailyPrice: 1 };
        break;
      case "price-high":
        sortStage = { normalizedDailyPrice: -1 };
        break;
      default:
        sortStage = { createdAt: -1 };
        break;
    }
    pipeline.push({ $sort: sortStage });

    console.log("API Route: Final aggregation pipeline:", JSON.stringify(pipeline, null, 2));
    
    // Populate manager (using $lookup)
    pipeline.push(
      { 
        $lookup: {
          from: "users",
          localField: "manager",
          foreignField: "_id",
          as: "managerInfo"
        }
      },
      {
        $unwind: {
          path: "$managerInfo",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          manager: {
            name: "$managerInfo.name",
            email: "$managerInfo.email"
          }
        }
      },
      {
        $project: {
          managerInfo: 0,
          normalizedDailyPrice: 0 // Clean up the temporary field
        }
      }
    );

    const properties = await Property.aggregate(pipeline);
    console.log(`API Route: Found ${properties.length} properties.`);
    return NextResponse.json(properties);
  } catch (error) {
    console.error("API Route Error: Error fetching properties:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    const property = await Property.create(data);

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
