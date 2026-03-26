import mongoose, { Schema, Model } from "mongoose";
import {
  MEDICAL_CONDITIONS,
  ALLERGIES,
  DIETARY_PREFERENCES,
  LANGUAGES,
} from "@/lib/constants";

// Re-export constants
export { MEDICAL_CONDITIONS, ALLERGIES, DIETARY_PREFERENCES, LANGUAGES };

export type MedicalCondition = (typeof MEDICAL_CONDITIONS)[number];
export type Allergy = (typeof ALLERGIES)[number];
export type DietaryPreference = (typeof DIETARY_PREFERENCES)[number];
export type Language = (typeof LANGUAGES)[number];

export interface IHealthProfile {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  age?: number | null;
  gender?: "male" | "female" | "other" | null;
  medicalConditions: MedicalCondition[];
  allergies: Allergy[];
  dietaryPreference: DietaryPreference;
  preferredLanguage: Language;
  additionalNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const HealthProfileSchema = new Schema<IHealthProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    medicalConditions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    dietaryPreference: {
      type: String,
      enum: DIETARY_PREFERENCES,
      default: "Non-Vegetarian",
    },
    preferredLanguage: {
      type: String,
      enum: LANGUAGES,
      default: "English",
    },
    additionalNotes: { type: String, default: null },
  },
  { timestamps: true }
);

export const HealthProfile: Model<IHealthProfile> =
  mongoose.models.HealthProfile ??
  mongoose.model<IHealthProfile>("HealthProfile", HealthProfileSchema);
