import { Document, Schema, Types, model } from 'mongoose';

export interface IWishlist {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  createdAt?: Date;
}

export interface IWishlistDocument extends IWishlist, Document {}

const wishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
      index: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(doc, ret: any) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Prevent duplicate wishlist records
wishlistSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const Wishlist = model<IWishlistDocument>('Wishlist', wishlistSchema);
export default Wishlist;
