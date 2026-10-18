import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  deleteMessage as deleteMessageApi,
  editMessage as editMessageApi,
  markRead as markReadApi,
  markUnread as markUnreadApi,
  saveProfile as saveProfileApi,
  searchPeople,
  sendMessage as sendMessageApi,
  setMemberFlags,
  setTyping,
  startDirect,
  syncInbox,
  updatePrivacy,
} from "./api";
import { defaultSettings } from "./settings";
import type { Chat, Folder, Message, Notice, Panel, Person, Profile, Settings } from "./types";

export const viewing = { chatId: null as string | null, visible: false };

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const typingSent = new Map<string, number>();
let inflight: Promise<void> | null = null;
let refreshQueued = false;
let audio: AudioContext | null = null;

function primeAudio() {
  try {
    if (!audio) audio = new AudioContext();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    audio = null;
  }
}

function playChime() {
  if (!audio) return;
  const ctx = audio;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(740, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.24);
}

function mergeThread(server: Message[], local: Message[]) {
  const pending = local.filter((message) => message.id.startsWith("local-"));
  return [...server, ...pending].sort((a, b) => a.createdAt - b.createdAt);
}

function pulseTyping(chatId: string, typing: boolean) {
  const now = Date.now();
  const prev = typingSent.get(chatId) ?? 0;
  if (typing && now - prev < 2000) return;
  typingSent.set(chatId, typing ? now : 0);
  void setTyping({ data: { conversationId: chatId, typing } }).catch(() => {});
}

type State = {
  profile: Profile;
  settings: Settings;
  chats: Chat[];
  booted: boolean;
  needsProfile: boolean;
  threadReadyId: string | null;
  activeChatId: string | null;
  mobileThread: boolean;
  panel: Panel;
  folder: Folder;
  listQuery: string;
  drafts: Record<string, string>;
  replyTo: Record<string, string | null>;
  editingId: string | null;
  selectedMessageId: string | null;
  threadSearchOpen: boolean;
  threadQuery: string;
  notice: Notice | null;
  live: string;
  refresh: () => Promise<void>;
  selectChat: (id: string, mobileThread?: boolean) => void;
  closeThread: () => void;
  openPanel: (panel: Panel) => void;
  setFolder: (folder: Folder) => void;
  setListQuery: (query: string) => void;
  setDraft: (chatId: string, text: string) => void;
  setReplyTo: (chatId: string, messageId: string | null) => void;
  selectMessage: (id: string | null) => void;
  startEdit: (messageId: string) => void;
  cancelEdit: () => void;
  commitEdit: (chatId: string, messageId: string, text: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  togglePin: (chatId: string) => void;
  toggleMute: (chatId: string) => void;
  markRead: (chatId: string) => void;
  markUnread: (chatId: string) => void;
  setThreadSearchOpen: (open: boolean) => void;
  setThreadQuery: (query: string) => void;
  dismissNotice: () => void;
  flash: (title: string, body: string) => void;
  saveProfile: (profile: Profile) => Promise<string>;
  updateSettings: (patch: Partial<Settings>) => void;
  findPeople: (query: string) => Promise<Person[]>;
  startChat: (username: string) => Promise<void>;
};

export const useMessenger = create<State>()(
  persist(
    (set, get) => ({
      profile: { name: "", username: "", bio: "", tone: 0 },
      settings: defaultSettings,
      chats: [],
      booted: false,
      needsProfile: false,
      threadReadyId: null,
      activeChatId: null,
      mobileThread: false,
      panel: "none",
      folder: "all",
      listQuery: "",
      drafts: {},
      replyTo: {},
      editingId: null,
      selectedMessageId: null,
      threadSearchOpen: false,
      threadQuery: "",
      notice: null,
      live: "",
      refresh: () => {
        if (inflight) {
          refreshQueued = true;
          return inflight;
        }
        const run = async () => {
          do {
            refreshQueued = false;
            const requestedId = get().activeChatId;
            try {
              const payload = await syncInbox({ data: { conversationId: requestedId } });
              if (!payload.profile) {
                set({ booted: true, needsProfile: true, chats: [] });
                continue;
              }
              const prev = get();
              const still = prev.activeChatId === requestedId;
              let notice = prev.notice;
              let live = prev.live;
              for (const chat of payload.chats) {
                const before = prev.chats.find((item) => item.id === chat.id);
                const fresh = before
                  ? chat.previewAt > before.previewAt && !chat.previewMine
                  : chat.unread > 0 && !chat.previewMine;
                const seen = viewing.visible && viewing.chatId === chat.id;
                if (fresh && !seen && prev.settings.notifications && !chat.muted && prev.booted) {
                  notice = { id: crypto.randomUUID(), title: chat.name, body: chat.preview, chatId: chat.id };
                  live = `${chat.name}. ${chat.preview}`;
                  playChime();
                }
              }
              const chats: Chat[] = payload.chats.map((chat) => {
                const previous = prev.chats.find((item) => item.id === chat.id);
                const showMessages = still && chat.id === requestedId;
                return {
                  ...chat,
                  pinRank: 0,
                  messages: showMessages ? mergeThread(payload.messages, previous?.messages ?? []) : (previous?.messages ?? []),
                };
              });
              const activeStillThere = !prev.activeChatId || chats.some((chat) => chat.id === prev.activeChatId);
              set({
                booted: true,
                needsProfile: false,
                profile: payload.profile,
                settings: {
                  ...prev.settings,
                  readReceipts: payload.readReceipts,
                  showLastSeen: payload.showLastSeen,
                },
                chats,
                threadReadyId: still && requestedId ? requestedId : prev.threadReadyId,
                activeChatId: activeStillThere ? prev.activeChatId : null,
                notice,
                live,
              });
            } catch (error) {
              const message = error instanceof Error ? error.message : "";
              if (/unauthorized/i.test(message)) {
                window.location.href = "/login";
                return;
              }
              set({ booted: true });
            }
          } while (refreshQueued);
        };
        inflight = run().finally(() => {
          inflight = null;
        });
        return inflight;
      },
      selectChat: (id, mobileThread = true) => {
        set({
          activeChatId: id,
          mobileThread,
          panel: "none",
          selectedMessageId: null,
          editingId: null,
          threadSearchOpen: false,
          threadQuery: "",
          threadReadyId: get().threadReadyId === id ? id : null,
        });
        void get().refresh();
      },
      closeThread: () =>
        set({ mobileThread: false, selectedMessageId: null, threadSearchOpen: false, editingId: null }),
      openPanel: (panel) => set({ panel, selectedMessageId: null }),
      setFolder: (folder) => set({ folder }),
      setListQuery: (listQuery) => set({ listQuery }),
      setDraft: (chatId, text) => {
        set((s) => ({ drafts: { ...s.drafts, [chatId]: text } }));
        const chat = get().chats.find((item) => item.id === chatId);
        if (chat && chat.kind !== "saved") pulseTyping(chatId, text.trim().length > 0);
      },
      setReplyTo: (chatId, messageId) =>
        set((s) => ({
          replyTo: { ...s.replyTo, [chatId]: messageId },
          editingId: null,
          selectedMessageId: null,
        })),
      selectMessage: (selectedMessageId) => set({ selectedMessageId }),
      startEdit: (messageId) =>
        set((s) => ({
          editingId: messageId,
          selectedMessageId: null,
          replyTo: s.activeChatId ? { ...s.replyTo, [s.activeChatId]: null } : s.replyTo,
        })),
      cancelEdit: () => set({ editingId: null }),
      commitEdit: (chatId, messageId, raw) => {
        const text = raw.trim();
        if (!text) return;
        set((s) => ({
          editingId: null,
          selectedMessageId: null,
          chats: s.chats.map((chat) =>
            chat.id !== chatId
              ? chat
              : {
                  ...chat,
                  messages: chat.messages.map((message) =>
                    message.id === messageId ? { ...message, text, edited: true } : message,
                  ),
                },
          ),
        }));
        void editMessageApi({ data: { conversationId: chatId, messageId, text } })
          .then(() => get().refresh())
          .catch(() => {
            get().flash("Could not edit", "Try again in a moment.");
            void get().refresh();
          });
      },
      deleteMessage: (chatId, messageId) => {
        set((s) => ({
          selectedMessageId: s.selectedMessageId === messageId ? null : s.selectedMessageId,
          editingId: s.editingId === messageId ? null : s.editingId,
          replyTo: Object.fromEntries(
            Object.entries(s.replyTo).map(([key, value]) => [key, value === messageId ? null : value]),
          ),
          chats: s.chats.map((chat) =>
            chat.id !== chatId ? chat : { ...chat, messages: chat.messages.filter((message) => message.id !== messageId) },
          ),
        }));
        void deleteMessageApi({ data: { conversationId: chatId, messageId } })
          .then(() => get().refresh())
          .catch(() => {
            get().flash("Could not delete", "Only your own messages can be removed.");
            void get().refresh();
          });
      },
      sendMessage: (chatId, raw) => {
        const text = raw.trim();
        if (!text) return;
        const state = get();
        const chat = state.chats.find((item) => item.id === chatId);
        if (!chat) return;
        primeAudio();
        const tempId = `local-${crypto.randomUUID()}`;
        const createdAt = Date.now();
        const replyToId = state.replyTo[chatId] || undefined;
        const optimistic: Message = {
          id: tempId,
          from: "me",
          text,
          createdAt,
          status: "sending",
          replyToId,
        };
        set({
          drafts: { ...state.drafts, [chatId]: "" },
          replyTo: { ...state.replyTo, [chatId]: null },
          editingId: null,
          selectedMessageId: null,
          chats: state.chats.map((item) =>
            item.id !== chatId
              ? item
              : {
                  ...item,
                  preview: text,
                  previewMine: true,
                  previewAt: createdAt,
                  messages: [...item.messages, optimistic],
                },
          ),
        });
        if (chat.kind !== "saved") pulseTyping(chatId, false);
        void sendMessageApi({ data: { conversationId: chatId, text, replyToId: replyToId ?? null } })
          .then((message) => {
            set((s) => ({
              chats: s.chats.map((item) =>
                item.id !== chatId
                  ? item
                  : {
                      ...item,
                      preview: message.text,
                      previewMine: true,
                      previewAt: message.createdAt,
                      messages: item.messages.map((entry) => (entry.id === tempId ? message : entry)),
                    },
              ),
            }));
            void get().refresh();
          })
          .catch(() => {
            set((s) => ({
              drafts: { ...s.drafts, [chatId]: text },
              chats: s.chats.map((item) =>
                item.id !== chatId
                  ? item
                  : { ...item, messages: item.messages.filter((entry) => entry.id !== tempId) },
              ),
            }));
            get().flash("Not sent", "Check your connection and try again.");
          });
      },
      togglePin: (chatId) => {
        const chat = get().chats.find((item) => item.id === chatId);
        if (!chat) return;
        const pinned = !chat.pinned;
        set((s) => ({
          chats: s.chats.map((item) => (item.id === chatId ? { ...item, pinned } : item)),
        }));
        void setMemberFlags({ data: { conversationId: chatId, pinned } }).catch(() => get().refresh());
      },
      toggleMute: (chatId) => {
        const chat = get().chats.find((item) => item.id === chatId);
        if (!chat) return;
        const muted = !chat.muted;
        set((s) => ({
          chats: s.chats.map((item) => (item.id === chatId ? { ...item, muted } : item)),
        }));
        void setMemberFlags({ data: { conversationId: chatId, muted } }).catch(() => get().refresh());
      },
      markRead: (chatId) => {
        const chat = get().chats.find((item) => item.id === chatId);
        if (!chat || chat.unread === 0) return;
        set((s) => ({
          chats: s.chats.map((item) => (item.id === chatId ? { ...item, unread: 0, lastReadAt: Date.now() } : item)),
        }));
        void markReadApi({ data: chatId }).then(() => get().refresh()).catch(() => {});
      },
      markUnread: (chatId) => {
        void markUnreadApi({ data: chatId }).then(() => get().refresh()).catch(() => {
          get().flash("Could not mark unread", "That chat has no incoming messages.");
        });
      },
      setThreadSearchOpen: (threadSearchOpen) =>
        set(threadSearchOpen ? { threadSearchOpen } : { threadSearchOpen, threadQuery: "" }),
      setThreadQuery: (threadQuery) => set({ threadQuery }),
      dismissNotice: () => set({ notice: null }),
      flash: (title, body) => set({ notice: { id: crypto.randomUUID(), title, body, chatId: null } }),
      saveProfile: async (profile) => {
        try {
          const result = await saveProfileApi({ data: profile });
          if (!result.ok) return result.error;
          set({
            profile,
            needsProfile: false,
            notice: {
              id: crypto.randomUUID(),
              title: "Profile updated",
              body: `${profile.name} · @${profile.username}`,
              chatId: null,
            },
          });
          await get().refresh();
          return "";
        } catch (error) {
          return error instanceof Error ? error.message : "Could not save your profile.";
        }
      },
      updateSettings: (patch) => {
        const settings = { ...get().settings, ...patch };
        set({ settings });
        if ("readReceipts" in patch || "showLastSeen" in patch) {
          void updatePrivacy({
            data: { readReceipts: settings.readReceipts, showLastSeen: settings.showLastSeen },
          }).catch(() => get().flash("Not saved", "Privacy settings will retry when you reopen."));
        }
      },
      findPeople: async (query) => {
        try {
          return await searchPeople({ data: query });
        } catch {
          return [];
        }
      },
      startChat: async (username) => {
        try {
          const result = await startDirect({ data: username });
          if (!result.ok) {
            get().flash("No chat started", result.error);
            return;
          }
          set({ panel: "none" });
          get().selectChat(result.conversationId);
        } catch {
          get().flash("No chat started", "Try that username again.");
        }
      },
    }),
    {
      name: "cove-live-v1",
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      skipHydration: true,
      partialize: (s) => ({
        settings: {
          theme: s.settings.theme,
          textSize: s.settings.textSize,
          wallpaper: s.settings.wallpaper,
          notifications: s.settings.notifications,
          sendWithEnter: s.settings.sendWithEnter,
          previewLinks: s.settings.previewLinks,
        },
        activeChatId: s.activeChatId,
        drafts: s.drafts,
        folder: s.folder,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        useMessenger.setState({
          settings: { ...defaultSettings, ...state.settings },
          panel: "none",
          mobileThread: false,
          notice: null,
          live: "",
          listQuery: "",
          threadQuery: "",
          threadSearchOpen: false,
          selectedMessageId: null,
          editingId: null,
          booted: false,
          needsProfile: false,
        });
      },
    },
  ),
);
