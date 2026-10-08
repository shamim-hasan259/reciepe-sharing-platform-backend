import { Document, Model, Schema, Types, model } from 'mongoose';

export interface IComment {
  recipeId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userImage?: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommentDocument extends IComment, Document {}

const commentSchema = new Schema<ICommentDocument>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe ID is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    userName: {
      type: String,
      required: true
    },
    userImage: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true
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

export const Comment = model<ICommentDocument>('Comment', commentSchema);
export default Comment;
