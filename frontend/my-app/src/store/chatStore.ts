import { create } from 'zustand';
import { ApiMessage, Chat, Message } from '@/types/chat';

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messagesMap: Record<string, Message[]>;

  setChats: (chats: Chat[]) => void;
  setActiveChatId: (id: string | null) => void;
  appendMessage: (chatId: string, msg: Message) => void;
  setMessages: (chatId: string, msgs: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatId: null,
  messagesMap: {},

  setChats: (chats) => set({ chats }),

  setActiveChatId: (id) => set({ activeChatId: id }),

  appendMessage: (chatId, msg) =>
    set((state) => {
      const existing = state.messagesMap[chatId] || [];

      if (existing.some((m) => m._id === msg._id)) {
        return state;
      }

      return {
        messagesMap: {
          ...state.messagesMap,
          [chatId]: [...existing, msg],
        },
      };
    }),

  setMessages: (chatId, msgs) =>
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [chatId]: msgs,
      },
    })),
}));