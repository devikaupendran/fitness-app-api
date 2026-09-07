import mongoose, {
  Document,
  Schema
} from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;

  email: string;
  phoneNumber: string;

  passwordHash: string;

  isEmailVerified: boolean;
  isActive: boolean;

  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;

  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;

  passwordChangedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    passwordResetTokenHash: {
      type: String,
      select: false
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false
    },

    emailVerificationTokenHash: {
      type: String,
      select: false
    },

    emailVerificationExpiresAt: {
      type: Date,
      select: false
    },

    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const User =
  mongoose.model<IUser>(
    "User",
    userSchema
  );