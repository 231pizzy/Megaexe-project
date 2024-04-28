import { Document, Schema, model } from 'mongoose'; // Import `model` function
import { User } from './user.model'; // Import the User type interface

export interface Post extends Document {
  image: string;
  content: string;
  category: string;
  user: User['_id']; 
  viewCount: number;
  upvoteCount: number;
  downvoteCount: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<Post>({
  image: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  viewCount: { type: Number, default: 0 },
  upvoteCount: { type: Number, default: 0 },
  downvoteCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Define the PostModel using the model function
export default model<Post>('Post', postSchema);

