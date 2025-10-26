import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  tokenId: string; // the jti from the signed refresh JWT
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
  replacedByTokenId?: string | null;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  tokenId: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: () => new Date() },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedByTokenId: { type: String, default: null },
});

export const RefreshToken = mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

export default RefreshToken;
