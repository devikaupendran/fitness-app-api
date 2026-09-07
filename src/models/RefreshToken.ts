import mongoose, {
  Document,
  Schema
} from "mongoose";

export interface IRefreshToken
  extends Document {

  userId: mongoose.Types.ObjectId;

  tokenHash: string;

  expiresAt: Date;

  revokedAt?: Date;

  replacedByTokenHash?: string;

  familyId: string;

  deviceId?: string;

  userAgent?: string;

  ipAddress?: string;

  createdAt: Date;
}

const refreshTokenSchema =
  new Schema<IRefreshToken>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true
      },

      revokedAt: {
        type: Date
      },

      replacedByTokenHash: {
        type: String
      },

      familyId: {
        type: String,
        required: true,
        index: true
      },

      deviceId: {
        type: String
      },

      userAgent: {
        type: String
      },

      ipAddress: {
        type: String
      }
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false
      }
    }
  );

refreshTokenSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0
  }
);

export const RefreshToken =
  mongoose.model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
  );