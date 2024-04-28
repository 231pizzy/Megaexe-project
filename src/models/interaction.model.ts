import { Document, Schema, model } from 'mongoose'; 
import {User}  from './user.model';
import { Post } from './post.model';

export interface Interaction extends Document {
  user: User['_id'];
  post: Post['_id'];
  comment?: string; 
  replies?: Reply[];
  upvoted: boolean;
  downvoted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Reply {
  user: User['_id'];
  comment: string;
  createdAt: Date;
}

const replySchema = new Schema<Reply>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


const interactionSchema = new Schema<Interaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  comment: { type: String},
  replies: [replySchema],
  upvoted: { type: Boolean, default: false},
  downvoted: { type: Boolean, default: false},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default model<Interaction>('Interaction', interactionSchema);

