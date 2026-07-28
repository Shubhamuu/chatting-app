import { useEffect } from 'react';
import { socket } from '@/services/socket';

interface Props {
  activeChatId: string | null;
  onMessage: (msg: any) => void;
  onTypingStart: (chatId: string) => void;
  onTypingStop: (chatId: string) => void;
}

export function useChatSocket({
  activeChatId,
  onMessage,
  onTypingStart,
  onTypingStop,
}: Props) {
  useEffect(() => {
    if (!activeChatId) return;

    socket.emit('join_room', activeChatId);

    return () => {
      socket.emit('leave_room', activeChatId);
    };
  }, [activeChatId]);

  useEffect(() => {
    socket.on('receive_message', onMessage);

    socket.on('typing_start', ({ chatId }) => {
      onTypingStart(chatId);
    });

    socket.on('typing_stop', ({ chatId }) => {
      onTypingStop(chatId);
    });

    return () => {
      socket.off('receive_message', onMessage);
      socket.off('typing_start');
      socket.off('typing_stop');
    };
  }, [onMessage, onTypingStart, onTypingStop]);
}