import { Document, Schema, Types, model } from 'mongoose';

export interface ICartItem {
  recipeId: Types.ObjectId;
  recipeName?: string;
  recipeImage?: string;
  quantity: number;
  price: number;
}

export interface ICart {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartDocument extends ICart, Document {}

const cartItemSchema = new Schema<ICartItem>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  { _id: false }
);

const cartSchema = new Schema<ICartDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Cart = model<ICartDocument>('Cart', cartSchema);
export default Cart;
