import mongoose, { Schema, Model } from "mongoose";

export interface IFoodProduct {
  _id: mongoose.Types.ObjectId;
  barcode?: string | null;
  name: string;
  brand?: string | null;
  ingredientsText?: string | null;
  ingredients?: string[];
  imageUrl?: string | null;
  nutriments?: Record<string, number>;
  source: "barcode" | "ocr" | "manual";
  createdAt: Date;
  updatedAt: Date;
}

const FoodProductSchema = new Schema<IFoodProduct>(
  {
    barcode: { type: String, default: null, index: true },
    name: { type: String, required: true },
    brand: { type: String, default: null },
    ingredientsText: { type: String, default: null },
    ingredients: { type: [String], default: [] },
    imageUrl: { type: String, default: null },
    nutriments: { type: Schema.Types.Mixed, default: {} },
    source: { type: String, enum: ["barcode", "ocr", "manual"], required: true },
  },
  { timestamps: true }
);

export const FoodProduct: Model<IFoodProduct> =
  mongoose.models.FoodProduct ??
  mongoose.model<IFoodProduct>("FoodProduct", FoodProductSchema);
