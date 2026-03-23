import mongoose, { Schema, Model } from "mongoose";

export type RiskLevel = "low" | "medium" | "high";

export interface IIngredientInsight {
  name: string;
  category: "safe" | "caution" | "harmful";
  explanation: string;
  reason?: string;
}

export interface IScanHistory {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId | null;
  productName: string;
  ingredientsText?: string | null;
  ingredients: string[];
  riskLevel: RiskLevel;
  riskSummary: string;
  ingredientInsights: IIngredientInsight[];
  recommendations: string[];
  barcode?: string | null;
  source: "barcode" | "ocr" | "manual";
  createdAt: Date;
}

const IngredientInsightSchema = new Schema(
  {
    name: String,
    category: { type: String, enum: ["safe", "caution", "harmful"] },
    explanation: String,
    reason: String,
  },
  { _id: false }
);

const ScanHistorySchema = new Schema<IScanHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "FoodProduct", default: null },
    productName: { type: String, required: true },
    ingredientsText: { type: String, default: null },
    ingredients: { type: [String], default: [] },
    riskLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    riskSummary: { type: String, required: true },
    ingredientInsights: { type: [IngredientInsightSchema], default: [] },
    recommendations: { type: [String], default: [] },
    barcode: { type: String, default: null },
    source: { type: String, enum: ["barcode", "ocr", "manual"], required: true },
  },
  { timestamps: true }
);

ScanHistorySchema.index({ userId: 1, createdAt: -1 });

export const ScanHistory: Model<IScanHistory> =
  mongoose.models.ScanHistory ??
  mongoose.model<IScanHistory>("ScanHistory", ScanHistorySchema);
