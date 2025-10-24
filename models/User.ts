import { SettingsState } from "@/types";
import mongoose, { Document, Schema } from "mongoose";

// Interface for User document
export interface IUser extends Document {
  fullName: string;
  email: string;
  role:"user"|"admin";
  passwordHash: string;
  preferences: SettingsState;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      saveResults: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        delete ret.__v;
        delete ret.passwordHash; // Always remove password hash from JSON
        return ret;
      },
    },
  }
);

// Create and export the User model
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
