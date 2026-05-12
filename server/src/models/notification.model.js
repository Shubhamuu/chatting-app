import mongoose from 'mongoose';
const { Schema } = mongoose;

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: String,
  message: String,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);