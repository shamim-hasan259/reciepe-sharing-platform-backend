import { Document, Schema, Types, model } from 'mongoose';

export interface ILike {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  createdAt?: Date;
}

export interface ILikeDocument extends ILike, Document {}

const likeSchema = new Schema<ILikeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

likeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const Like = model<ILikeDocument>('Like', likeSchema);
export default Like;
