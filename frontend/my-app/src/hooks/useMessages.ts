import { useCallback, useState } from 'react';
import { apiprivate } from '@/services/api';
import { Message } from '@/types/chat';

export function useMessages() {
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);

    try {
      const { data } = await apiprivate.get(
        `/chats/${chatId}/messages`,
      );

      const raw = data?.messages?.messages || [];

      const mapped: Message[] = raw.map((msg: any) => ({
        _id: msg._id,
        text: msg.content,
        senderId: msg.sender?._id,
        senderName: msg.sender?.name,
        time: msg.createdAt,
        chatId: msg.chat,
      }));

      return mapped;
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  return {
    fetchMessages,
    loadingMessages,
  };
}