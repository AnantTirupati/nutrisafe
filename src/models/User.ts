import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
  passwordHash?: string | null;
  accounts?: { provider: string; providerAccountId: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date, default: null },
    name: { type: String, default: null },
    image: { type: String, default: null },
    passwordHash: { type: String, default: null },
    accounts: [
      {
        provider: String,
        providerAccountId: String,
      },
    ],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
