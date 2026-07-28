import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import TypingIndicator from '@/components/chat/TypingIndicator';

import { useChatSocket } from '@/hooks/useChatSocket';
import { useChatStore } from '@/store/chatStore';
import { useMessages } from '@/hooks/useMessages';

import { apiprivate } from '@/services/api';
import { socket } from '@/services/socket';

import { Chat, Message } from '@/types/chat';

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user');

    if (!raw) return null;

    return JSON.parse(raw);
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default function MessagingDashboard() {
  const currentUser = getCurrentUser();

  const {
    chats,
    activeChatId,
    messagesMap,
    setChats,
    setActiveChatId,
    appendMessage,
    setMessages,
  } = useChatStore();

  const { fetchMessages } = useMessages();

  const [newMessage, setNewMessage] = useState('');
  const [typingMap, setTypingMap] = useState<
    Record<string, boolean>
  >({});

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /* ------------------------------------------------ */
  /* ACTIVE CHAT                                      */
  /* ------------------------------------------------ */

  const activeChat = useMemo(() => {
    return chats.find(
      (chat) => chat.id === activeChatId,
    );
  }, [chats, activeChatId]);

  const currentMessages = useMemo(() => {
    return messagesMap[activeChatId || ''] || [];
  }, [messagesMap, activeChatId]);

  /* ------------------------------------------------ */
  /* LOAD CHATS                                       */
  /* ------------------------------------------------ */

  const loadChats = useCallback(async () => {
    try {
      const { data } = await apiprivate.get('/chats');

      const mapped: Chat[] = data.chats.map((c: any) => {
        const other = c.participants.find(
          (p: any) => p._id !== currentUser?._id,
        );

        return {
          id: c._id,
          name: other?.name || 'Unknown User',
          avatar: other?._id
            ? `https://i.pravatar.cc/150?u=${other._id}`
            : '',
          email: other?.email,
          online: false,
          message:
            c.lastMessage?.content || 'No messages yet',
          updatedAt:
            c.lastMessage?.createdAt ||
            new Date().toISOString(),
          unread: c.unreadCount || 0,
          otherUserId: other?._id,
        };
      });

      setChats(mapped);

      if (!activeChatId && mapped.length > 0) {
        setActiveChatId(mapped[0].id);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    loadChats();
  }, []);

  /* ------------------------------------------------ */
  /* LOAD MESSAGES                                    */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (!activeChatId) return;

    const load = async () => {
      try {
        const msgs = await fetchMessages(
          activeChatId,
        );

        setMessages(activeChatId, msgs);

        socket.emit('messages_seen', {
          chatId: activeChatId,
        });
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [activeChatId]);

  /* ------------------------------------------------ */
  /* SOCKET EVENTS                                    */
  /* ------------------------------------------------ */

  useChatSocket({
    activeChatId,

    onMessage: (apiMsg) => {
      const mapped: Message = {
        _id: apiMsg._id,
        text: apiMsg.content,
        senderId: apiMsg.sender?._id,
        senderName: apiMsg.sender?.name,
        time: apiMsg.createdAt,
        chatId: apiMsg.chat,
      };

      appendMessage(mapped.chatId, mapped);
    },

    onTypingStart: (chatId) => {
      setTypingMap((prev) => ({
        ...prev,
        [chatId]: true,
      }));
    },

    onTypingStop: (chatId) => {
      setTypingMap((prev) => ({
        ...prev,
        [chatId]: false,
      }));
    },
  });

  /* ------------------------------------------------ */
  /* SEND MESSAGE                                     */
  /* ------------------------------------------------ */

  const handleSend = async () => {
    const text = newMessage.trim();

    if (!text || !activeChatId) return;

    const optimisticMessage: Message = {
      _id: crypto.randomUUID(),
      text,
      senderId: currentUser._id,
      senderName: currentUser.name,
      time: new Date().toISOString(),
      chatId: activeChatId,
      pending: true,
    };

    appendMessage(
      activeChatId,
      optimisticMessage,
    );

    setNewMessage('');

    socket.emit('typing_stop', {
      chatId: activeChatId,
    });

    try {
      const { data } = await apiprivate.post(
        '/chats/message',
        {
          chatId: activeChatId,
          content: text,
        },
      );

      appendMessage(activeChatId, {
        _id: data.message._id,
        text: data.message.content,
        senderId: data.message.sender._id,
        senderName: data.message.sender.name,
        time: data.message.createdAt,
        chatId: data.message.chat,
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------------------------------------ */
  /* TYPING                                           */
  /* ------------------------------------------------ */

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!activeChatId) return;

    socket.emit('typing_start', {
      chatId: activeChatId,
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit('typing_stop', {
        chatId: activeChatId,
      });
    }, 1000);
  };

  /* ------------------------------------------------ */
  /* EMPTY STATE                                      */
  /* ------------------------------------------------ */

  const EmptyState = () => (
    <div className="flex flex-1 items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="mb-5 flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-zinc-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-zinc-200">
          No conversation selected
        </h2>

        <p className="mt-2 text-zinc-500">
          Choose a chat from the sidebar
        </p>
      </div>
    </div>
  );

  /* ------------------------------------------------ */
  /* RENDER                                           */
  /* ------------------------------------------------ */

  return (
    <div className="h-screen w-full flex overflow-hidden bg-zinc-950 text-white">

      {/* SIDEBAR */}
      <aside className="w-[320px] min-w-[320px] max-w-[320px] flex flex-col border-r border-zinc-800 bg-zinc-900">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelect={(chatId) => {
            setActiveChatId(chatId);
          }}
        />
      </aside>

      {/* CHAT AREA */}
      <main className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {!activeChat ? (
          <EmptyState />
        ) : (
          <>
            {/* HEADER */}
            <header className="h-[70px] shrink-0 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between">

              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={activeChat.avatar}
                    alt={activeChat.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  {activeChat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="font-semibold text-zinc-100 truncate">
                    {activeChat.name}
                  </h2>

                  <p className="text-xs text-zinc-500">
                    {activeChat.online
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                    />
                    <line
                      x1="21"
                      y1="21"
                      x2="16.65"
                      y2="16.65"
                    />
                  </svg>
                </button>

                <button className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="12"
                      cy="5"
                      r="1"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="1"
                    />
                    <circle
                      cx="12"
                      cy="19"
                      r="1"
                    />
                  </svg>
                </button>
              </div>
            </header>

            {/* MESSAGES */}
            <section className="flex-1 min-h-0 overflow-hidden bg-zinc-950">
              <MessageList
                key={activeChatId}
                messages={currentMessages}
                currentUserId={currentUser._id}
              />
            </section>

            {/* TYPING */}
            {typingMap[activeChatId || ''] && (
              <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950">
                <TypingIndicator />
              </div>
            )}

            {/* INPUT */}
            <footer className="shrink-0 border-t border-zinc-800 bg-zinc-900">
              <MessageInput
                value={newMessage}
                onChange={handleTyping}
                onSend={handleSend}
              />
            </footer>
          </>
        )}
      </main>
    </div>
  );
}