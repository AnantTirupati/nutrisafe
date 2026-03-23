import mongoose, { Schema, Model } from "mongoose";

export interface IIngredientKnowledge {
  _id: mongoose.Types.ObjectId;
  name: string;
  aliases: string[];
  category: "additive" | "preservative" | "allergen" | "nutrient" | "other";
  description: string;
  eNumber?: string | null;
  concerns: string[];
  relatedConditions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IngredientKnowledgeSchema = new Schema<IIngredientKnowledge>(
  {
    name: { type: String, required: true, index: true },
    aliases: { type: [String], default: [] },
    category: {
      type: String,
      enum: ["additive", "preservative", "allergen", "nutrient", "other"],
      default: "other",
    },
    description: { type: String, required: true },
    eNumber: { type: String, default: null },
    concerns: { type: [String], default: [] },
    relatedConditions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const IngredientKnowledge: Model<IIngredientKnowledge> =
  mongoose.models.IngredientKnowledge ??
  mongoose.model<IIngredientKnowledge>("IngredientKnowledge", IngredientKnowledgeSchema);
