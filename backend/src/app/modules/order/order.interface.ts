import { Document, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  recipeId: Types.ObjectId;
  recipeName: string;
  recipeImage?: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  userId: Types.ObjectId;
  userEmail: string;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string;
  stripeSessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {}
