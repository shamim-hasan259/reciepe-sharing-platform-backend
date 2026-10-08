import { Document, Schema, Types, model } from 'mongoose';

export type PaymentType = 'ORDER' | 'PREMIUM_MEMBERSHIP';

export interface IPayment {
  userId: Types.ObjectId;
  userEmail: string;
  orderId?: Types.ObjectId;
  type: PaymentType;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPaymentDocument extends IPayment, Document {}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true
    },
    type: {
      type: String,
      enum: ['ORDER', 'PREMIUM_MEMBERSHIP'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'usd'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    stripeSessionId: {
      type: String,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid',
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'card'
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

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);
export default Payment;
