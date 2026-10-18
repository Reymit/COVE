import type { Chat, Folder } from "./types";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function lastActivity(chat: Chat) {
  return chat.messages.at(-1)?.createdAt ?? chat.previewAt ?? 0;
}

export function sortChats(chats: Chat[]) {
  return [...chats].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return lastActivity(b) - lastActivity(a);
  });
}

export function unreadCount(chat: Chat) {
  return chat.unread;
}

export function formatClock(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatListTime(ts: number, now = Date.now()) {
  if (!ts) return "";
  const d = new Date(ts);
  const today = new Date(now);
  if (d.toDateString() === today.toDateString()) return formatClock(ts);
  const y = new Date(now - 86_400_000);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  if (now - ts < 7 * 86_400_000) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDayLabel(ts: number, now = Date.now()) {
  const d = new Date(ts);
  const today = new Date(now);
  if (d.toDateString() === today.toDateString()) return "Today";
  const y = new Date(now - 86_400_000);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

export function formatLastSeen(ts: number, now = Date.now()) {
  const d = new Date(ts);
  if (d.toDateString() === new Date(now).toDateString()) return `today at ${formatClock(ts)}`;
  return formatListTime(ts, now).toLowerCase();
}

export function presenceLine(chat: Chat, showLastSeen: boolean) {
  if (chat.kind === "saved") return "Only visible to you";
  if (chat.typing) return "typing…";
  if (chat.online) return "online";
  if (!showLastSeen || !chat.lastSeen) return "last seen recently";
  return `last seen ${formatLastSeen(chat.lastSeen)}`;
}

export function lastPreview(chat: Chat) {
  const last = chat.messages.at(-1);
  if (last) return `${last.from === "me" ? "You: " : ""}${last.text}`;
  if (!chat.preview) return "No messages yet";
  return `${chat.previewMine ? "You: " : ""}${chat.preview}`;
}

export function chatVisible(chat: Chat, folder: Folder, query: string) {
  if (folder === "unread" && unreadCount(chat) === 0) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (chat.name.toLowerCase().includes(q) || chat.username.toLowerCase().includes(q)) return true;
  return chat.messages.some((m) => m.text.toLowerCase().includes(q)) || chat.preview.toLowerCase().includes(q);
}

export function searchPreview(chat: Chat, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  if (chat.name.toLowerCase().includes(q) || chat.username.toLowerCase().includes(q)) return null;
  const hit = [...chat.messages].reverse().find((m) => m.text.toLowerCase().includes(q));
  if (hit) return hit.text;
  return chat.preview.toLowerCase().includes(q) ? chat.preview : null;
}

export function sameDay(a: number, b: number) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}
