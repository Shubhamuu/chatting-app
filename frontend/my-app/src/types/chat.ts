export interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  online?: boolean;
}

export interface Participant extends User {}

export interface LastMessage {
  content?: string;
  createdAt?: string;
}

export interface ApiChat {
  _id?: string;
  id?: string;
  participants?: Participant[];
  email?: string;
  online?: boolean;
  message?: string;
  updatedAt?: string;
  unreadCount?: number;
  lastMessage?: LastMessage;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  online: boolean;
  message: string;
  updatedAt?: string;
  time: string | null;
  unread: number;
  otherUserId?: string | null;
  isGroup?: boolean;
}
export type MessagePagination = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  totalMessages: number;
};

export interface ApiMessage {
  _id?: string;
  id?: string;
  content?: string;
  text?: string;
conversationId?: string;
  sender?: Participant;
  senderId?: string;
  senderName?: string;

  createdAt?: string;
  time?: string;

  chat?: string;
  chatId?: string;
}
export interface TypingEvent {
  userId: string;
  chatId: string;
}
export interface Message {
  _id: string;
  text: string;
  senderId: string;
  senderName: string;
  time: string;
  chatId: string;
  delivered?: boolean;
  seen?: boolean;
  pending?: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  totalChats: number;
}
export type FetchMessagesResponse = {
  success: boolean;
  messages: {
    messages: ApiMessage[];
    totalMessages: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};
export interface GroupedMessage extends Message {
  from: "me" | "them";
  isFirst: boolean;
}
export interface FetchChatsResponse {
  chats: ApiChat[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  totalChats: number;
}