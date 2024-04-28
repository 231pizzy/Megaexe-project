import { Document, Schema, model } from 'mongoose';

export interface User extends Document {
  name: string;
  picture: string;
  password: string;
  email: string;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  picture: { type: String, required: true },
  password: { type: String, required: true },
});

export default model<User>('User', userSchema);
