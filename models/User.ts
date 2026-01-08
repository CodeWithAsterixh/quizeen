/* eslint-disable @typescript-eslint/no-explicit-any */
import { SettingsState } from "@/types";
import mongoose, { Document, Schema } from "mongoose";

// Interface for User document
export interface IUser extends Document {
  fullName: string;
  email: string;
  role: "student" | "admin" | "creator" | "guest" | "none";
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
      enum: ['student', 'admin', 'creator', 'guest', 'none'],
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
      transform: (doc: any, ret: any) => {
        // normalize _id and timestamps for JSON consumers
        if (ret?._id) ret._id = ret._id.toString();
        if (ret?.createdAt) ret.createdAt = (ret.createdAt as Date).toISOString();
        if (ret?.updatedAt) ret.updatedAt = (ret.updatedAt as Date).toISOString();
        // remove internal fields
        try {
          delete (ret).__v;
          delete (ret).passwordHash; // Always remove password hash from JSON
        } catch {
          // ignore
        }
        return ret;
      },
    },
  }
);

// Create and export the User model
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
