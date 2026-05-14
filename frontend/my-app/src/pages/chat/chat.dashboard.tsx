import React, { useState, useEffect, useRef } from 'react';

/* ---------- Type definitions ---------- */

/* ---------- Mock server data ---------- */
const serverChats = [
  { id: 1, name: "Alex Johnson", message: "Are we meeting today?", time: "2m ago", unread: 2, avatar: "https://i.pravatar.cc/150?img=1", online: true, role: "Product Manager" },
  { id: 2, name: "Sarah Parker", message: "The files are uploaded.", time: "8m ago", unread: 0, avatar: "https://i.pravatar.cc/150?img=2", online: false, role: "Designer" },
  { id: 3, name: "David Miller", message: "Can you review the UI?", time: "12m ago", unread: 1, avatar: "https://i.pravatar.cc/150?img=3", online: true, role: "Frontend Dev" },
  { id: 4, name: "Emily Wilson", message: "Thanks for the update!", time: "20m ago", unread: 0, avatar: "https://i.pravatar.cc/150?img=4", online: false, role: "QA Engineer" },
  { id: 5, name: "Michael Brown", message: "Let's deploy tonight.", time: "28m ago", unread: 3, avatar: "https://i.pravatar.cc/150?img=5", online: true, role: "DevOps" },
  { id: 6, name: "Sophia Lee", message: "The API is working now.", time: "34m ago", unread: 0, avatar: "https://i.pravatar.cc/150?img=6", online: true, role: "Backend Dev" },
  { id: 7, name: "James Carter", message: "I'll send the docs shortly.", time: "45m ago", unread: 0, avatar: "https://i.pravatar.cc/150?img=7", online: false, role: "Tech Lead" },
  { id: 8, name: "Olivia Smith", message: "Need help with authentication.", time: "1h ago", unread: 5, avatar: "https://i.pravatar.cc/150?img=8", online: true, role: "Security" },
  { id: 9, name: "Daniel White", message: "Database migration completed.", time: "2h ago", unread: 0, avatar: "https://i.pravatar.cc/150?img=9", online: false, role: "DBA" },
  { id: 10, name: "Emma Davis", message: "See you tomorrow 👋", time: "5h ago", unread: 0, avatar: "https://i.pravatar.cc/150?img=10", online: true, role: "Scrum Master" },
];

const serverMessages = {
  1: [
    { from: 'them', text: 'Hey, are we still meeting today?', time: '4:32 PM' },
    { from: 'me', text: "Yes, around 5 PM. I'll share the details soon.", time: '4:33 PM' },
    { from: 'them', text: 'Perfect 👍', time: '4:34 PM' },
    { from: 'them', text: 'Should I bring the documents?', time: '4:35 PM' },
    { from: 'me', text: 'Yes please, that would be great!', time: '4:36 PM' },
  ],
  2: [
    { from: 'them', text: 'The files are uploaded to the shared drive.', time: '3:15 PM' },
    { from: 'me', text: "Great, I'll check them out now.", time: '3:18 PM' },
    { from: 'them', text: 'Let me know if you need any changes.', time: '3:20 PM' },
  ],
  3: [
    { from: 'them', text: 'Can you review the UI changes I made?', time: '2:45 PM' },
    { from: 'me', text: 'Sure, send me the link.', time: '2:50 PM' },
    { from: 'them', text: 'Here it is: https://figma.com/file/...', time: '2:51 PM' },
    { from: 'me', text: 'Looks clean! Just a few minor tweaks needed.', time: '3:00 PM' },
  ],
  4: [
    { from: 'them', text: 'Thanks for the update! Everything looks good.', time: '1:30 PM' },
    { from: 'me', text: 'Glad to hear that! Let me know if anything comes up.', time: '1:32 PM' },
  ],
  5: [
    { from: 'them', text: "Let's deploy tonight around 8 PM.", time: '12:10 PM' },
    { from: 'me', text: "Sounds good. I'll prep the release notes.", time: '12:15 PM' },
    { from: 'them', text: 'Make sure to run the tests first.', time: '12:16 PM' },
    { from: 'them', text: 'And update the changelog.', time: '12:17 PM' },
    { from: 'me', text: 'Will do. Everything is under control.', time: '12:20 PM' },
  ],
  6: [
    { from: 'them', text: 'The API is working now. All endpoints are responding.', time: '11:00 AM' },
    { from: 'me', text: 'Amazing! What was the issue?', time: '11:05 AM' },
    { from: 'them', text: 'Just a caching problem. Cleared it and everything is fine.', time: '11:06 AM' },
  ],
  7: [
    { from: 'them', text: "I'll send the docs shortly.", time: '10:30 AM' },
    { from: 'me', text: 'No rush, take your time.', time: '10:32 AM' },
  ],
  8: [
    { from: 'them', text: 'Need help with authentication setup.', time: '9:00 AM' },
    { from: 'me', text: 'What exactly are you stuck on?', time: '9:10 AM' },
    { from: 'them', text: "The OAuth flow isn't redirecting properly.", time: '9:12 AM' },
    { from: 'them', text: 'I keep getting a 401 error.', time: '9:13 AM' },
    { from: 'me', text: 'Check your redirect URI in the console. It might be misconfigured.', time: '9:15 AM' },
    { from: 'them', text: 'Found it! Thanks so much.', time: '9:20 AM' },
  ],
  9: [
    { from: 'them', text: 'Database migration completed successfully.', time: 'Yesterday' },
    { from: 'me', text: 'All data intact?', time: 'Yesterday' },
    { from: 'them', text: 'Yes, verified all tables. Zero data loss.', time: 'Yesterday' },
  ],
  10: [
    { from: 'them', text: 'See you tomorrow 👋', time: 'Yesterday' },
    { from: 'me', text: 'Looking forward to it! Have a great evening.', time: 'Yesterday' },
    { from: 'them', text: 'You too! 😊', time: 'Yesterday' },
  ],
};

const AUTO_REPLIES = [
  'Got it, thanks!',
  'Sounds good 👍',
  'Let me check and get back to you.',
  'Perfect!',
  "I'll take care of it.",
  'Great, thanks for letting me know!',
  'hello',
];

/* ---------- Icons ---------- */
const Icon = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Compose: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.61-.61a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.19 16.9z"/>
    </svg>
  ),
  Video: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  MoreH: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    </svg>
  ),
  Attach: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  ),
  Emoji: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

/* ---------- Component ---------- */
export default function MessagingDashboard() {
  const [activeChatId, setActiveChatId] = useState(1);
  const [chats] = useState(serverChats);
  const [messagesMap, setMessagesMap] = useState(serverMessages);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);
  const currentMessages = messagesMap[activeChatId] || [];

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.message.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = chats.reduce((acc, c) => acc + c.unread, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    setMessagesMap(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), { from: 'me', text, time: timeStr }],
    }));
    setNewMessage('');

    setIsTyping(true);
    const delay = 1500 + Math.random() * 2000;
    setTimeout(() => {
      setIsTyping(false);
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setMessagesMap(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), { from: 'them', text: reply, time: replyTime }],
      }));
    }, delay);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* Group messages by sender for visual grouping */
  const groupedMessages = currentMessages.reduce((acc, msg, i) => {
    const prev = currentMessages[i - 1];
    const isFirst = !prev || prev.from !== msg.from;
    acc.push({ ...msg, isFirst });
    return acc;
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg-base: #0d0f12;
          --bg-surface: #13161b;
          --bg-raised: #1a1e26;
          --bg-hover: #1f2430;
          --bg-active: #252c3a;
          --border: rgba(255,255,255,0.06);
          --border-strong: rgba(255,255,255,0.1);
          --text-primary: #e8eaf0;
          --text-secondary: #8b90a0;
          --text-muted: #555c70;
          --accent: #4f7ef8;
          --accent-soft: rgba(79,126,248,0.12);
          --accent-glow: rgba(79,126,248,0.25);
          --green: #34c97a;
          --green-soft: rgba(52,201,122,0.12);
          --red: #f25c5c;
          --bubble-me: #2d4bb0;
          --bubble-me-end: #3d5fd4;
          --bubble-them: #1e2330;
          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 20px;
          --radius-xl: 28px;
          --font: 'DM Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.5);
          --shadow-accent: 0 4px 20px var(--accent-glow);
        }

        .msg-shell {
          display: flex; align-items: stretch;
          height: 100vh; min-height: 560px;
          background: var(--bg-base);
          font-family: var(--font);
          color: var(--text-primary);
          overflow: hidden;
        }

        /* ---- Sidebar ---- */
        .sidebar {
          width: 300px; flex-shrink: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          height: 100%;
        }

        .sidebar-header {
          padding: 20px 18px 0;
          flex-shrink: 0;
        }

        .brand-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }

        .brand {
          display: flex; align-items: center; gap: 10px;
        }

        .brand-icon {
          width: 34px; height: 34px;
          background: var(--accent);
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--shadow-accent);
          flex-shrink: 0;
        }

        .brand-name {
          font-size: 15px; font-weight: 600;
          letter-spacing: -0.3px;
          color: var(--text-primary);
        }

        .brand-badge {
          font-size: 11px; font-weight: 600;
          background: var(--accent);
          color: #fff;
          padding: 2px 7px;
          border-radius: 20px;
          margin-left: 4px;
          vertical-align: middle;
        }

        .icon-btn {
          width: 32px; height: 32px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .icon-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }

        .search-wrap {
          position: relative; margin-bottom: 18px;
        }
        .search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 9px 12px 9px 36px;
          font-family: var(--font); font-size: 13px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus {
          border-color: var(--accent);
          background: var(--bg-active);
        }

        .section-label {
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-muted);
          padding: 0 18px 8px;
        }

        .chat-list {
          flex: 1; overflow-y: auto;
          padding: 0 8px;
        }
        .chat-list::-webkit-scrollbar { width: 4px; }
        .chat-list::-webkit-scrollbar-track { background: transparent; }
        .chat-list::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }

        .chat-item {
          display: flex; align-items: center; gap: 11px;
          padding: 9px 10px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background 0.12s;
          position: relative;
        }
        .chat-item:hover { background: var(--bg-hover); }
        .chat-item.active {
          background: var(--bg-active);
        }
        .chat-item.active::before {
          content: '';
          position: absolute; left: -8px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 22px;
          background: var(--accent);
          border-radius: 0 3px 3px 0;
        }

        .avatar-wrap { position: relative; flex-shrink: 0; }
        .avatar {
          width: 40px; height: 40px;
          border-radius: 50%; object-fit: cover;
        }
        .avatar-lg {
          width: 38px; height: 38px;
          border-radius: 50%; object-fit: cover;
          border: 2px solid var(--border-strong);
        }
        .online-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 10px; height: 10px;
          background: var(--green);
          border: 2px solid var(--bg-surface);
          border-radius: 50%;
        }

        .chat-meta { flex: 1; min-width: 0; }
        .chat-name-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 2px;
        }
        .chat-name {
          font-size: 13.5px; font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 140px;
        }
        .chat-time {
          font-size: 11px; color: var(--text-muted);
          flex-shrink: 0; margin-left: 6px;
        }
        .chat-preview-row {
          display: flex; align-items: center; justify-content: space-between;
        }
        .chat-preview {
          font-size: 12.5px; color: var(--text-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 160px;
        }
        .unread-badge {
          font-size: 10.5px; font-weight: 600;
          background: var(--accent);
          color: #fff;
          min-width: 18px; height: 18px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 5px;
          flex-shrink: 0;
        }

        .sidebar-footer {
          flex-shrink: 0;
          padding: 14px 18px;
          border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
        }
        .footer-info { flex: 1; min-width: 0; }
        .footer-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .footer-status {
          font-size: 11.5px; color: var(--green);
          display: flex; align-items: center; gap: 5px;
        }
        .status-dot {
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse-green 2.5s ease-in-out infinite;
        }

        /* ---- Main chat ---- */
        .chat-main {
          flex: 1; display: flex; flex-direction: column;
          background: var(--bg-base);
          min-width: 0;
        }

        .chat-header {
          height: 62px;
          padding: 0 20px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg-surface);
          flex-shrink: 0;
        }

        .chat-header-left {
          display: flex; align-items: center; gap: 12px;
        }

        .chat-header-info {}
        .chat-header-name {
          font-size: 14.5px; font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.2px;
        }
        .chat-header-sub {
          font-size: 12px; color: var(--text-muted);
          display: flex; align-items: center; gap: 5px;
          margin-top: 1px;
        }
        .online-label { color: var(--green); }

        .header-actions {
          display: flex; align-items: center; gap: 6px;
        }

        .header-btn {
          height: 32px; padding: 0 12px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-family: var(--font); font-size: 12.5px; font-weight: 500;
          display: flex; align-items: center; gap: 6px;
          cursor: pointer;
          transition: all 0.12s;
        }
        .header-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }
        .header-btn.icon-only { padding: 0; width: 32px; justify-content: center; }

        /* ---- Messages area ---- */
        .messages-area {
          flex: 1; overflow-y: auto;
          padding: 24px 24px 8px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .messages-area::-webkit-scrollbar { width: 5px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 5px; }

        .date-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 16px 0 12px;
        }
        .date-divider-line { flex: 1; height: 1px; background: var(--border); }
        .date-divider-label {
          font-size: 11px; font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .msg-row {
          display: flex;
          margin-bottom: 2px;
          animation: msg-in 0.2s ease-out both;
        }
        .msg-row.me { justify-content: flex-end; }
        .msg-row.them { justify-content: flex-start; }
        .msg-row.first-in-group { margin-top: 10px; }

        .msg-avatar-space {
          width: 32px; flex-shrink: 0; margin-right: 8px;
          display: flex; align-items: flex-end;
        }
        .msg-avatar-small {
          width: 28px; height: 28px;
          border-radius: 50%; object-fit: cover;
          border: 1px solid var(--border);
        }

        .msg-bubble-wrap {
          display: flex; flex-direction: column;
          max-width: 60%;
        }
        .msg-sender-name {
          font-size: 11px; font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 4px; margin-left: 4px;
        }

        .bubble {
          padding: 9px 14px;
          border-radius: 18px;
          position: relative;
          line-height: 1.5;
          word-break: break-word;
        }
        .bubble.me {
          background: linear-gradient(135deg, var(--bubble-me), var(--bubble-me-end));
          color: #e8edf8;
          border-bottom-right-radius: 5px;
          box-shadow: 0 2px 12px rgba(45,75,176,0.35);
        }
        .bubble.them {
          background: var(--bubble-them);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-bottom-left-radius: 5px;
        }
        .bubble-text { font-size: 14px; }
        .bubble-time {
          font-size: 10.5px;
          margin-top: 3px;
          display: block;
          text-align: right;
        }
        .bubble.me .bubble-time { color: rgba(200,210,255,0.5); }
        .bubble.them .bubble-time { color: var(--text-muted); }

        /* Typing indicator */
        .typing-row {
          display: flex; align-items: flex-end; gap: 8px;
          margin-top: 10px; margin-bottom: 4px;
          animation: msg-in 0.2s ease-out both;
        }
        .typing-bubble {
          background: var(--bubble-them);
          border: 1px solid var(--border);
          border-radius: 18px; border-bottom-left-radius: 5px;
          padding: 10px 16px;
          display: flex; gap: 4px; align-items: center;
        }
        .typing-dot {
          width: 6px; height: 6px;
          background: var(--text-muted);
          border-radius: 50%;
          animation: typing-bounce 1.4s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        /* ---- Input bar ---- */
        .input-bar {
          flex-shrink: 0;
          padding: 14px 20px 18px;
          border-top: 1px solid var(--border);
          background: var(--bg-surface);
        }
        .input-row {
          display: flex; align-items: center; gap: 8px;
        }
        .input-actions-left {
          display: flex; gap: 4px; flex-shrink: 0;
        }
        .input-icon-btn {
          width: 34px; height: 34px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: color 0.12s, background 0.12s;
        }
        .input-icon-btn:hover { color: var(--text-secondary); background: var(--bg-hover); }

        .input-field-wrap { flex: 1; position: relative; }
        .message-input {
          width: 100%;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-family: var(--font); font-size: 14px;
          color: var(--text-primary);
          outline: none;
          resize: none;
          transition: border-color 0.15s;
          line-height: 1.4;
          min-height: 42px; max-height: 120px;
        }
        .message-input::placeholder { color: var(--text-muted); }
        .message-input:focus { border-color: rgba(79,126,248,0.4); }

        .send-btn {
          width: 40px; height: 40px;
          background: var(--accent);
          border: none;
          border-radius: var(--radius-sm);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-accent);
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          flex-shrink: 0;
        }
        .send-btn:hover {
          background: #5d88fa;
          box-shadow: 0 4px 24px rgba(79,126,248,0.4);
        }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled {
          background: var(--bg-raised);
          color: var(--text-muted);
          box-shadow: none;
          cursor: default;
        }

        /* ---- Animations ---- */
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes msg-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scrollbar for messages */
        .messages-area::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
      `}</style>

      <div className="msg-shell">
        {/* ===== SIDEBAR ===== */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="brand-row">
              <div className="brand">
                <div className="brand-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span className="brand-name">
                  Chatting App
                  {totalUnread > 0 && <span className="brand-badge">{totalUnread}</span>}
                </span>
              </div>
              <button className="icon-btn" title="Compose">
                <Icon.Compose />
              </button>
            </div>

            <div className="search-wrap">
              <span className="search-icon"><Icon.Search /></span>
              <input
                type="text"
                className="search-input"
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="section-label">Direct Messages</div>

          <div className="chat-list">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="avatar-wrap">
                  <img src={chat.avatar} alt={chat.name} className="avatar" />
                  {chat.online && <div className="online-dot" />}
                </div>
                <div className="chat-meta">
                  <div className="chat-name-row">
                    <span className="chat-name">{chat.name}</span>
                    <span className="chat-time">{chat.time}</span>
                  </div>
                  <div className="chat-preview-row">
                    <span className="chat-preview">{chat.message}</span>
                    {chat.unread > 0 && (
                      <span className="unread-badge">{chat.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="avatar-wrap">
              <img src="https://i.pravatar.cc/150?img=12" alt="You" className="avatar-lg" />
              <div className="online-dot" style={{ borderColor: 'var(--bg-surface)' }} />
            </div>
            <div className="footer-info">
              <div className="footer-name">Jordan Lee</div>
              <div className="footer-status">
                <div className="status-dot" />
                Active now
              </div>
            </div>
            <button className="icon-btn" title="Settings">
              <Icon.Settings />
            </button>
          </div>
        </div>

        {/* ===== MAIN CHAT ===== */}
        <div className="chat-main">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="avatar-wrap">
                <img src={activeChat?.avatar} alt={activeChat?.name} className="avatar-lg" />
                {activeChat?.online && <div className="online-dot" style={{ borderColor: 'var(--bg-surface)' }} />}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{activeChat?.name}</div>
                <div className="chat-header-sub">
                  
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  {activeChat?.online
                    ? <span className="online-label">Online</span>
                    : <span>Offline</span>
                  }
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button className="header-btn">
                <Icon.Phone /> Call
              </button>
              <button className="header-btn">
                <Icon.Video /> Video
              </button>
              <button className="header-btn icon-only" title="Info">
                <Icon.Info />
              </button>
              <button className="header-btn icon-only" title="More">
                <Icon.MoreH />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            <div className="date-divider">
              <div className="date-divider-line" />
              <div className="date-divider-label">Today</div>
              <div className="date-divider-line" />
            </div>

            {groupedMessages.map((msg, i) => (
              <div
                key={i}
                className={`msg-row ${msg.from} ${msg.isFirst ? 'first-in-group' : ''}`}
                style={{ animationDelay: `${Math.min(i * 0.04, 0.5)}s` }}
              >
                {msg.from === 'them' && (
                  <div className="msg-avatar-space">
                    {msg.isFirst && (
                      <img src={activeChat?.avatar} alt="" className="msg-avatar-small" />
                    )}
                  </div>
                )}
                <div className="msg-bubble-wrap">
                  {msg.from === 'them' && msg.isFirst && (
                    <div className="msg-sender-name">{activeChat?.name}</div>
                  )}
                  <div className={`bubble ${msg.from}`}>
                    <span className="bubble-text">{msg.text}</span>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="typing-row">
                <div className="msg-avatar-space">
                  <img src={activeChat?.avatar} alt="" className="msg-avatar-small" />
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
              <div className="input-actions-left">
                <button className="input-icon-btn" title="Attach file"><Icon.Attach /></button>
              </div>
              <div className="input-field-wrap">
                <input
                  ref={inputRef}
                  type="text"
                  className="message-input"
                  placeholder={`Message ${activeChat?.name}…`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button className="input-icon-btn" title="Emoji"><Icon.Emoji /></button>
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
        </div>
      </div>
    </>
  );
}