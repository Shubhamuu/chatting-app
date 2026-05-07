import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true,
              unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatar:   { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  pushToken:{ type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
