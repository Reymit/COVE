export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  createdAt: number;
  status: MessageStatus;
  replyToId?: string;
  edited?: boolean;
};

export type Folder = "all" | "unread";

export type Chat = {
  id: string;
  kind: "direct" | "saved";
  name: string;
  username: string;
  bio: string;
  tone: number;
  online: boolean;
  lastSeen: number;
  pinned: boolean;
  pinRank: number;
  muted: boolean;
  lastReadAt: number;
  typing: boolean;
  unread: number;
  preview: string;
  previewMine: boolean;
  previewAt: number;
  messages: Message[];
};

export type Profile = {
  name: string;
  username: string;
  bio: string;
  tone: number;
};

export type Person = {
  username: string;
  name: string;
  bio: string;
  tone: number;
};

export type ThemeMode = "light" | "dark" | "system";
export type TextSize = "sm" | "md" | "lg";
export type Wallpaper = "plain" | "dots" | "grid";

export type Settings = {
  theme: ThemeMode;
  textSize: TextSize;
  wallpaper: Wallpaper;
  notifications: boolean;
  sendWithEnter: boolean;
  readReceipts: boolean;
  showLastSeen: boolean;
  previewLinks: boolean;
};

export type Panel = "none" | "settings" | "profile" | "people";

export type Notice = {
  id: string;
  title: string;
  body: string;
  chatId: string | null;
};
