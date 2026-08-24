import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiprivate } from '../../services/api';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import './chat.dashboard.css';


const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
});


import type {
  User,
  Chat,
  Message,
  ApiChat,
  ApiMessage,
  Pagination,
  MessagePagination,
  FetchMessagesResponse,
  TypingEvent,
  GroupedMessage,
  FetchChatsResponse,
  

} from "../../types/chat";
/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const currentUser: User = JSON.parse(
  localStorage.getItem("user") ?? "{}"
);
const mapChat = (c: ApiChat): Chat =>{
  let name = 'user';
  let avatar = '';

  const p0 = c.participants?.[0];
  const p1 = c.participants?.[1];

  // IF current user is participant[0]
  if (p0?.name === currentUser.name) {
    name = p1?.name ?? 'user';
    avatar = p1?._id
      ? `https://i.pravatar.cc/150?u=${p1._id}`
      : '';
  } 
  // ELSE use participant[0]
  else {
    name = p0?.name ?? 'user';
    avatar = p0?._id
      ? `https://i.pravatar.cc/150?u=${p0._id}`
      : '';
  }

  return {
   id: c._id ?? c.id ?? "",
    name,
    avatar: avatar || `https://i.pravatar.cc/150?u=${c._id ?? c.id}`,
    email: c.email ?? '',
    online: c.online ?? false,
    message: c.lastMessage?.content ?? c.message ?? '',
    time: c.lastMessage?.createdAt ?? c.updatedAt ?? null,
    unread: c.unreadCount ?? 0,
    otherUserId:
      p0?.name === currentUser.name ? p1?._id : p0?._id ?? null,
  };
};
const getChatId = (chat: unknown): string => {
  if (!chat) return "";
  if (typeof chat === "string") return chat;
  if (typeof chat === "object" && "_id" in chat) return (chat as { _id: string })._id;
  return "";
};
const mapMessage = (msg: ApiMessage): Message => ({
  _id: msg._id ?? msg.id ?? "",
  text: msg.content ?? msg.text ?? '',
  senderId: msg.sender?._id ?? msg.senderId ?? '',
  senderName: msg.sender?.name ?? msg.senderName ?? '',
  time: msg.createdAt ?? msg.time ?? new Date().toISOString(),
  chatId: msg.conversationId ?? getChatId(msg.chat) ?? msg.chatId ?? "",
});

const sortChats = (list: Chat[]): Chat[] =>
  [...list].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
       return (
      new Date(b.time).getTime() -
      new Date(a.time).getTime()
    );

  });

const formatTime = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return isToday
    ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ─────────────────────────────────────────────
   Icons
───────────────────────────────────────────── */
const Icon = {
  Search: () => (
    <svg width="1" height="1" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="1" cy="1" r="1" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Compose: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.61-.61a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.19 16.9z" />
    </svg>
  ),
  Video: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  MoreH: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  ),
  Attach: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  Emoji: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  MessageSquare: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function MessagingDashboards() {

const [activeChatId, setActiveChatId] = useState<string | null>(null);

const [chats, setChats] = useState<Chat[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    totalChats: 0,
  });

const [loadingChats, setLoadingChats] = useState<boolean>(false);

const [loadingMore, setLoadingMore] = useState<boolean>(false);

const [messagesMap, setMessagesMap] = useState<
  Record<string, Message[]>
>({});
function smoothScrollToBottomUntilStable(el: HTMLElement, options = {}) {
  const { maxWaitMs = 3000, stableFramesNeeded = 5 } = options as any;
  let lastHeight = -1;
  let stableCount = 0;
  let rafId: number;
  const startTime = performance.now();

  const step = () => {
    const target = el.scrollHeight - el.clientHeight;
    const distance = target - el.scrollTop;

    // ease toward target instead of snapping
    if (Math.abs(distance) > 1) {
      el.scrollTop += distance * 0.2;
    } else {
      el.scrollTop = target;
    }

    const currentHeight = el.scrollHeight;
    const timedOut = performance.now() - startTime > maxWaitMs;

    if (currentHeight === lastHeight && Math.abs(distance) <= 1) {
      stableCount++;
    } else {
      stableCount = 0;
      lastHeight = currentHeight;
    }

    if (stableCount >= stableFramesNeeded || timedOut) return;
    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(rafId);
}
const [loadingMessages, setLoadingMessages] =
  useState<boolean>(false);

const [newMessage, setNewMessage] = useState<string>("");

const [search, setSearch] = useState<string>("");

const [typingMap, setTypingMap] = useState<
  Record<string, boolean>
>({});

 const messagesEndRef = useRef<HTMLDivElement | null>(null);

const messagesAreaRef = useRef<HTMLDivElement | null>(null); 

const inputRef = useRef<HTMLInputElement | null>(null);

const chatListRef = useRef<HTMLDivElement | null>(null);

const typingTimerRef = useRef<
  Record<string, ReturnType<typeof setTimeout>>
>({});

const prevChatIdRef = useRef<string | null>(null);
const isLoadingOlderRef = useRef<boolean>(false); 
type MessagePaginationMap = Record<string, MessagePagination>;

const [messagePagination, setMessagePagination] = useState<MessagePaginationMap>({});


const [loadingMoreMessages, setLoadingMoreMessages] = useState<boolean>(false);


const typingEmitTimer = useRef<ReturnType<typeof setTimeout> | null>(
  null
);

const isEmittingTyping = useRef<boolean>(false);

  /* ── Derived ── */
const activeChat =
  chats.find((c) => c.id === activeChatId) ?? null;

const currentMessages = activeChatId
  ? messagesMap[activeChatId] ?? []
  : [];

const isTyping = activeChatId
  ? typingMap[activeChatId] ?? false
  : false;

const filteredChats = chats.filter(
  (c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.message.toLowerCase().includes(search.toLowerCase())
);

const totalUnread = chats.reduce(
  (acc, c) => acc + (c.unread ?? 0),
  0
);

  /* ── 1. Append message: dedup by _id, keep sorted ── */
 const appendMessage = useCallback(
  (chatId: string, mapped: Message) => {
    setMessagesMap((prev) => {
      const existing = prev[chatId] ?? [];

      if (
        mapped._id &&
        existing.some((m) => m._id === mapped._id)
      ) {
        return prev;
      }

      const updated = [...existing, mapped].sort(
        (a, b) =>
          new Date(a.time).getTime() -
          new Date(b.time).getTime()
      );

      return {
        ...prev,
        [chatId]: updated,
      };
    });
  },
  []
);

  /* ── 2. Fetch chat list ──
     NOTE: activeChatId intentionally excluded from deps — we only want
     to auto-select the first chat on the initial load, not re-fetch
     every time the user switches chats.                               */
const fetchChats = useCallback(
  async (page: number = 1,append: boolean = false): Promise<void> => {
    page === 1
      ? setLoadingChats(true)
      : setLoadingMore(true);

    try {
      const { data } =
        await apiprivate.get<FetchChatsResponse>(
          `/chats?page=${page}`
        );

      const {
        chats: raw,
        currentPage,
        totalPages,
        hasNextPage,
        totalChats,
      } = data;

      const mapped: Chat[] = raw.map(mapChat);

      setChats((prev: Chat[]) => {
        const combined = append
          ? [...prev, ...mapped]
          : mapped;

        const unique = Array.from(
          new Map(
            combined.map((chat) => [chat.id, chat] as const)
          ).values()
        );

        return sortChats(unique);
      });

      setPagination({
        currentPage,
        totalPages,
        hasNextPage,
        totalChats,
      });

      if (!append && mapped.length > 0) {
        setActiveChatId(
          (cur) => cur ?? mapped[0].id
        );
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
      toast.error("Failed to load conversations");
    } finally {
      setLoadingChats(false);
      setLoadingMore(false);
    }
  },
  []
);
  useEffect(() => { fetchChats(1); }, [fetchChats]);

  /* ── 3. Fetch messages ── */
const fetchMessages = useCallback(
  async (chatId: string, page: number=1, append: boolean = false) => {
    if (!chatId) return;

    page === 1 ? setLoadingMessages(true) : setLoadingMoreMessages(true);

    // preserve scroll position when prepending older messages
    const el = messagesAreaRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;

    try {
      console.log('fetchMessages', chatId, 'page', page, 'append', append);
      const { data } = await apiprivate.get<FetchMessagesResponse>(
        `/chats/${chatId}/messages?page=${page}`
      );

      const {
        messages: raw,
        currentPage,
        totalPages,
        hasNextPage,
        totalMessages,
      } = data.messages;

      const mapped = raw.map(mapMessage);

      setMessagesMap((prev) => {
        const existing = prev[chatId] ?? [];

        const combined = append ? [...mapped, ...existing] : mapped;

        const unique = Array.from(
          new Map(combined.map((m) => [m._id, m] as const)).values()
        );

        unique.sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        return { ...prev, [chatId]: unique };
      });

      setMessagePagination((prev) => ({
        ...prev,
        [chatId]: {
          currentPage,
          totalPages,
          hasNextPage,
          totalMessages,
        },
      }));

      // restore scroll offset after older messages are prepended above
      if (append && el) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevScrollHeight;
        });
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      toast.error("Failed to load messages");

      if (!append) {
        setMessagesMap((prev) => ({ ...prev, [chatId]: [] }));
      }
    } finally {
      setLoadingMessages(false);
      setLoadingMoreMessages(false);
        isLoadingOlderRef.current = false;
    }
  },
  []
);

  /* ── 4. Room management: leave old, join new ── */
  useEffect(() => {
    if (prevChatIdRef.current && prevChatIdRef.current !== activeChatId) {
      socket.emit('leave_room', prevChatIdRef.current);
    }
    prevChatIdRef.current = activeChatId;

    if (!activeChatId) return;

    socket.emit('join_room', activeChatId);
    fetchMessages(activeChatId,1);

    // Clear unread badge when opening this chat
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, unread: 0 } : c)),
    );
  }, [activeChatId, fetchMessages]);

  /* ── 5. Join personal notification room once ── */
  useEffect(() => {
    if (!currentUser?._id) return;
    socket.emit('join_user', currentUser._id);
  }, []); // run once on mount
useEffect(() => {
  if (isLoadingOlderRef.current) {
    isLoadingOlderRef.current = false;
    return;
  }

  const el = messagesAreaRef.current;
  if (!el) return;

  const cancel = smoothScrollToBottomUntilStable(el);
  return cancel; // cleanup if currentMessages changes again before it settles
}, [currentMessages]);
  /* ── 6. receive_message socket handler ──
     Re-registers when activeChatId changes so the badge logic
     correctly knows which chat is currently open.               */
useEffect(() => {
const handler = (apiMsg: ApiMessage) => {
  const chatId = getChatId(apiMsg.chat) || (apiMsg.chatId ?? "");
  if (!chatId) return;
  
    if(currentUser?._id === apiMsg.sender?._id) return; // ignore own messages
    
    const mapped = mapMessage(apiMsg);

    setMessagesMap((prev) => {
      const existing = prev[chatId] ?? [];

      if (existing.some((m) => m._id === mapped._id)) {
        return prev;
      }

      return {
        ...prev,
        [chatId]: [...existing, mapped].sort(
          (a, b) =>
            new Date(a.time).getTime() -
            new Date(b.time).getTime()
        ),
      };
    });

    setChats((prev) =>
      sortChats(
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                message: mapped.text,
                time: mapped.time,
                unread:
                  chatId === activeChatId
                    ? 0
                    : (c.unread ?? 0) + 1,
              }
            : c
        )
      )
    );
  };

  socket.on("receive_message", handler);

  return () => {
    socket.off("receive_message", handler);
  };
}, [activeChatId]);

  /* ── 7. Typing indicator receivers ── */
useEffect(() => {
  const startHandler = ({ chatId, userId }: TypingEvent) => {
    if (!chatId) return;

    setTypingMap((prev) => ({ ...prev, [chatId]: true }));

    clearTimeout(typingTimerRef.current[chatId]);
    typingTimerRef.current[chatId] = setTimeout(() => {
      setTypingMap((prev) => ({ ...prev, [chatId]: false }));
    }, 3000);
  };

  const stopHandler = ({ chatId }: TypingEvent) => {
    if (!chatId) return;

    clearTimeout(typingTimerRef.current[chatId]);
    setTypingMap((prev) => ({ ...prev, [chatId]: false }));
  };

  socket.on("typing_start", startHandler);
  socket.on("typing_stop", stopHandler);

  return () => {
    socket.off("typing_start", startHandler);
    socket.off("typing_stop", stopHandler);
  };
}, []); // stable — setTypingMap is stable

  /* ── 8. Typing emitter — debounced ── */
const handleTyping = useCallback(
  (value: string) => {
    setNewMessage(value);

    if (!activeChatId) return;

    // emit only once
    if (!isEmittingTyping.current) {
      socket.emit('typing_start', {
        chatId: activeChatId,
         userId: currentUser._id, 
      });

      isEmittingTyping.current = true;
    }

    // clear old timer
    if (typingEmitTimer.current) {
      clearTimeout(typingEmitTimer.current);
    }

    // stop typing after delay
    typingEmitTimer.current = setTimeout(() => {
      socket.emit('typing_stop', {
        chatId: activeChatId,
         userId: currentUser._id, 
      });

      isEmittingTyping.current = false;
    }, 1500);
  },
  [activeChatId],
);

  /* ── 9. Infinite scroll ── */
  const handleChatListScroll = useCallback(() => {
    const el = chatListRef.current;
    if (!el || loadingMore || !pagination.hasNextPage) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      fetchChats(pagination.currentPage + 1, true);
    }
  }, [loadingMore, pagination, fetchChats]);
const handleMessagesScroll = useCallback(() => {
  const el = messagesAreaRef.current;
  if (!el || !activeChatId || loadingMoreMessages) return;

  const pag = messagePagination[activeChatId];
  //console.log('handleMessagesScroll', el.scrollTop, pag);
  if (!pag?.hasNextPage) return;
 
  if (el.scrollTop <= 40) {
     console.log('fetching older messages for chat', activeChatId, 'page', pag.currentPage + 1);
    isLoadingOlderRef.current = true;
    fetchMessages(activeChatId, pag.currentPage + 1, true);
  }
}, [activeChatId, loadingMoreMessages, messagePagination, fetchMessages]);
      /* ── 10. Auto-scroll to latest message ── */


  /* ── 11. Send message ── */
const handleSend = useCallback(() => {
  const text = newMessage.trim();

  if (!text || !activeChatId) return;

  socket.emit("typing_stop", {
    chatId: activeChatId,
     userId: currentUser._id, 
  });

  isEmittingTyping.current = false;

  if (typingEmitTimer.current) {
    clearTimeout(typingEmitTimer.current);
  }

  const tempId = `temp_${Date.now()}`;

  const optimistic: Message = {
    _id: tempId,
    text,
    senderId: currentUser._id,
    senderName: currentUser.name,
    time: new Date().toISOString(),
    chatId: activeChatId,
    pending: true,
  };

  appendMessage(activeChatId, optimistic);

  setChats((prev) =>
    sortChats(
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              message: text,
              time: optimistic.time,
            }
          : c
      )
    )
  );

  setNewMessage("");

  socket.emit("send_message", {
    sender:{ _id: currentUser._id, name: currentUser.name },
    chatId: activeChatId,
    content: text,
    tempId,
  });
}, [
  newMessage,
  activeChatId,
  appendMessage,
  currentUser,
]);

const handleKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSend();
  }
};
  /* ── 12. Group consecutive messages from the same sender ── */

const groupedMessages: GroupedMessage[] =
  currentMessages.reduce<GroupedMessage[]>(
    (acc, msg) => {
      const from: "me" | "them" =
        msg.senderId === activeChat?.otherUserId
          ? "them"
          : "me";

      const prev = acc[acc.length - 1];

      acc.push({
        ...msg,
        from,
        isFirst: !prev || prev.from !== from,
      });

      return acc;
    },
    []
  );
  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <>

      <div className="msg-shell">
        {/* ===== SIDEBAR ===== */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="brand-row">
              <div className="brand">
                <div className="brand-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="brand-name">
                  Messages
                  {totalUnread > 0 && (
                    <span className="brand-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
                  )}
                </span>
              </div>
              <button className="icon-btn" title="Compose"><Icon.Compose /></button>
            </div>

            <div className="search-wrap">
              <span className="search-icon"><Icon.Search /></span>
              <input
                type="text"
                className="search-input"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="section-label">
            <span>Direct Messages</span>
            {pagination.totalChats > 0 && (
              <span className="section-label-count">{pagination.totalChats} total</span>
            )}
          </div>

          {/* Chat list */}
          <div className="chat-list" ref={chatListRef} onScroll={handleChatListScroll}>
            {loadingChats ? (
              <div className="chat-list-loading">
                <Icon.Loader /> Loading chats…
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="chat-list-loading" style={{ flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {search ? 'No chats match your search' : 'No conversations yet'}
                </span>
              </div>
            ) : (
              <>
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item${activeChatId === chat?.id ? ' active' : ''}`}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <div className="avatar-wrap">
                      <img src={chat.avatar} alt={chat.name} className="avatar" />
                      {chat.online && <div className="online-dot" />}
                    </div>
                    <div className="chat-meta">
                      <div className="chat-name-row">
                        <span className="chat-name">{chat.name}</span>
                        {/* formatTime converts ISO → readable label */}
                        <span className="chat-time">{formatTime(chat.time)}</span>
                      </div>
                      <div className="chat-preview-row">
                        <span className="chat-preview">{chat.message}</span>
                        {chat.unread > 0 && (
                          <span className="unread-badge">
                            {chat.unread > 99 ? '99+' : chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loadingMore && (
                  <div className="load-more-row">
                    <Icon.Loader /> Loading more…
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="page-btns">
                <button
                  className="page-btn"
                  disabled={pagination.currentPage <= 1 || loadingChats}
                  onClick={() => fetchChats(pagination.currentPage - 1)}
                >
                  <Icon.ChevronLeft /> Prev
                </button>
                <button className="page-btn active" disabled>
                  {pagination.currentPage}
                </button>
                <button
                  className="page-btn"
                  disabled={!pagination.hasNextPage || loadingChats}
                  onClick={() => fetchChats(pagination.currentPage + 1)}
                >
                  Next <Icon.ChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="avatar-wrap">
              <img src={`https://i.pravatar.cc/150?u=${currentUser?._id}`} alt="You" className="avatar-lg" />
              <div className="online-dot" style={{ borderColor: 'var(--bg-surface)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="footer-name">{currentUser?.name ?? 'You'}</div>
              <div className="footer-status">
                <div className="status-dot" /> Active now
              </div>
            </div>
            <button className="icon-btn" title="Settings"><Icon.Settings /></button>
          </div>
        </div>

        {/* ===== MAIN CHAT ===== */}
        <div className="chat-main">
          {!activeChat ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Icon.MessageSquare /></div>
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="avatar-wrap">
                    <img src={activeChat.avatar} alt={activeChat.name} className="avatar-lg" />
                    {activeChat.online && <div className="online-dot" style={{ borderColor: 'var(--bg-surface)' }} />}
                  </div>
                  <div>
                    <div className="chat-header-name">{activeChat.name}</div>
                    <div className="chat-header-sub">
                      {activeChat.email && (
                        <>
                          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{activeChat.email}</span>
                          <span style={{ color: 'var(--border-strong)' }}>·</span>
                        </>
                      )}
                      {activeChat.online
                        ? <span className="online-label">Online</span>
                        : <span>Offline</span>}
                    </div>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="header-btn"><Icon.Phone /> Call</button>
                  <button className="header-btn"><Icon.Video /> Video</button>
                  <button className="header-btn icon-only" title="Info"><Icon.Info /></button>
                  <button className="header-btn icon-only" title="More"><Icon.MoreH /></button>
                </div>
              </div>

              {/* Messages */}
              <div
  className="messages-area"
  ref={messagesAreaRef}
  onScroll={handleMessagesScroll}
>
  {loadingMoreMessages && (
    <div style={{ textAlign: 'center', padding: 8, color: 'var(--text-muted)', fontSize: 12 }}>
      <Icon.Loader /> Loading older messages…
    </div>
  )}

                {loadingMessages ? (
                  <div style={{ margin: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                    <Icon.Loader /> Loading messages…
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="no-messages-state">
                    <div className="no-messages-icon"><Icon.MessageSquare /></div>
                    <div className="no-messages-title">No messages yet</div>
                    <div className="no-messages-sub">Say hi to {activeChat.name}!</div>
                  </div>
                ) : (
                  <>
                    <div className="date-divider">
                      <div className="date-divider-line" />
                      <div className="date-divider-label">Today</div>
                      <div className="date-divider-line" />
                    </div>

                   {groupedMessages.map((msg) => (
  <div
    key={msg._id}
    className={`msg-row ${msg.from}${
      msg.isFirst ? " first-in-group" : ""
    }`}
  >
    {msg.from === "them" && (
      <div className="msg-avatar-space">
        {msg.isFirst && (
          <img
            src={activeChat?.avatar}
            alt=""
            className="msg-avatar-small"
          />
        )}
      </div>
    )}

    <div className="msg-bubble-wrap">
      {msg.from === "them" && msg.isFirst && (
        <div className="msg-sender-name">
          {activeChat?.name}
        </div>
      )}

      <div className={`bubble ${msg.from}`}>
        <span className="bubble-text">{msg.text}</span>
        <span className="bubble-time">
          {formatTime(msg.time)}
        </span>
      </div>
    </div>
  </div>
))}
                  </>
                )}

                {/* Typing indicator */}
                {isTyping && !loadingMessages && (
                  <div className="typing-row">
                    <div className="msg-avatar-space">
                      <img src={activeChat.avatar} alt="" className="msg-avatar-small" />
                    </div>
                    <div className="typing-bubble">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
             <div className="input-bar">
  <div className="input-row">
    <button className="input-icon-btn" title="Attach file">
      <Icon.Attach />
    </button>

   <input
  ref={inputRef}
  type="text"
  className="message-input"
  placeholder={`Message ${activeChat?.name ?? ""}…`}
  value={newMessage}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    handleTyping(e.target.value)
  }
  onKeyDown={handleKeyDown}
/>

    <button className="input-icon-btn" title="Emoji">
      <Icon.Emoji />
    </button>

    <button
      className="send-btn"
      onClick={handleSend}
      disabled={!newMessage.trim()}
      title="Send"
    >
      <Icon.Send />
    </button>
  </div>
</div>
            </>
          )}
        </div>
      </div>
    </>
  );
}