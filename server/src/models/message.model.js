const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  content: String,

  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'call'],
    default: 'text'
  },

  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  },

  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  attachments: [String],
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);