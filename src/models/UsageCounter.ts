import mongoose, { Schema, Model } from "mongoose";

export type UsageAction = "scan" | "chat" | "dietPlan";

export interface IUsageCounter {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: UsageAction;
  period: string; // "YYYY-MM-DD" for daily actions, "YYYY-MM" for monthly
  count: number;
  updatedAt: Date;
}

const UsageCounterSchema = new Schema<IUsageCounter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["scan", "chat", "dietPlan"], required: true },
    period: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

UsageCounterSchema.index({ userId: 1, action: 1, period: 1 }, { unique: true });

export const UsageCounter: Model<IUsageCounter> =
  mongoose.models.UsageCounter ?? mongoose.model<IUsageCounter>("UsageCounter", UsageCounterSchema);
