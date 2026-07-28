import { useMemo, useState } from 'react';
import { Chat } from '@/types/chat';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
}

const formatTime = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

const AVATAR_PALETTES = [
  { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-700 dark:text-pink-300' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const getPalette = (name: string) =>
  AVATAR_PALETTES[
    name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_PALETTES.length
  ];

function Avatar({ chat }: { chat: Chat }) {
  const { bg, text } = getPalette(chat.name);
  const initials = getInitials(chat.name);

  return (
    <div className="relative shrink-0">
      {chat.avatar ? (
        <img
          src={chat.avatar}
          alt={chat.name}
          className="w-12 h-12 rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/10"
        />
      ) : (
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-semibold ${bg} ${text} ring-1 ring-black/5 dark:ring-white/10`}
        >
          {initials}
        </div>
      )}

      {chat.online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
      )}
    </div>
  );
}

function UnreadBadge({ count }: { count: number }) {
  return (
    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none shrink-0 shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-5 pt-4 pb-2">
      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function ChatItem({
  chat,
  isActive,
  onSelect,
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative mx-2 w-[calc(100%-16px)] flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-200 border ${
        isActive
          ? 'bg-zinc-100/90 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 shadow-sm'
          : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/45 hover:border-zinc-100 dark:hover:border-zinc-800'
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500" />
      )}

      <Avatar chat={chat} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {chat.name}
          </p>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0">
            {formatTime(chat.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p
            className={`text-[12.5px] truncate ${
              chat.unread > 0
                ? 'text-zinc-700 dark:text-zinc-200 font-medium'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            {chat.message || 'No messages yet'}
          </p>

          {chat.unread > 0 && <UnreadBadge count={chat.unread} />}
        </div>
      </div>
    </button>
  );
}

export default function ChatSidebar({ chats, activeChatId, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      chats.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.message?.toLowerCase().includes(query.toLowerCase())
      ),
    [chats, query]
  );

  const recent = filtered.filter((c) => c.message);

  return (
    <aside className="w-[340px] flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[24px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Messages
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Your conversations in one place
            </p>
          </div>

          <button
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/70 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
            aria-label="New chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-zinc-100/90 dark:bg-zinc-800/70 rounded-2xl px-3.5 py-2.5 ring-1 ring-transparent focus-within:ring-blue-500/20 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all">
          <svg
            className="w-4 h-4 text-zinc-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-zinc-300 dark:text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No conversations found</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Try a different name or message</p>
            </div>
          </div>
        ) : (
          <>
            <SectionLabel label="Recent" />
            {recent.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={() => onSelect(chat.id)}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}