import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["rent", "sell"],
      required: true,
      default: "rent",
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    price: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      currency: {
        type: String,
        default: "DH",
      },
    },
    images: [
      {
        url: String,
        publicId: String,
        caption: String,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["available", "rented", "maintenance"],
      default: "available",
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      title: String,
      description: String,
      keywords: [String],
    },
    availability: [
      {
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ["available", "booked", "blocked"],
          default: "available",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

propertySchema.index({ title: "text", description: "text" });
propertySchema.index({ "location.city": 1, "location.country": 1 });
propertySchema.index({ status: 1 });

export const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);
// export const Property = mongoose.model("Property", propertySchema);
