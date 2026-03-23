import mongoose, { Schema, Model } from "mongoose";

export interface IDietPlan {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const DietPlanSchema = new Schema<IDietPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const DietPlan: Model<IDietPlan> =
  mongoose.models.DietPlan ?? mongoose.model<IDietPlan>("DietPlan", DietPlanSchema);
