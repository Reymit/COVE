import { useEffect } from "react";
import { X } from "lucide-react";
import { unreadCount } from "@/lib/messenger/format";
import { useMessenger, viewing } from "@/lib/messenger/store";
import { applyTheme } from "@/lib/messenger/theme";
import { Sidebar } from "./sidebar";
import { Stage } from "./thread";

export function MessengerApp() {
  const settings = useMessenger((s) => s.settings);
  const chats = useMessenger((s) => s.chats);
  const activeChatId = useMessenger((s) => s.activeChatId);
  const mobileThread = useMessenger((s) => s.mobileThread);
  const panel = useMessenger((s) => s.panel);
  const notice = useMessenger((s) => s.notice);
  const live = useMessenger((s) => s.live);
  const markRead = useMessenger((s) => s.markRead);
  const dismissNotice = useMessenger((s) => s.dismissNotice);
  const selectChat = useMessenger((s) => s.selectChat);
  const openPanel = useMessenger((s) => s.openPanel);
  const closeThread = useMessenger((s) => s.closeThread);
  const selectMessage = useMessenger((s) => s.selectMessage);
  const setThreadSearchOpen = useMessenger((s) => s.setThreadSearchOpen);

  const lastId = chats.find((c) => c.id === activeChatId)?.messages.at(-1)?.id ?? "";
  const unread = chats.reduce((n, c) => n + (c.muted ? 0 : unreadCount(c)), 0);

  useEffect(() => {
    applyTheme(settings.theme);
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings.theme]);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void useMessenger.getState().refresh();
    };
    const id = window.setInterval(tick, 2500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) Cove` : "Cove";
  }, [unread]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 880px)");
    const sync = () => {
      const visible = Boolean(activeChatId) && (mq.matches || (mobileThread && panel === "none"));
      viewing.chatId = activeChatId;
      viewing.visible = visible;
      if (visible && activeChatId) markRead(activeChatId);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [activeChatId, mobileThread, panel, lastId, markRead]);

  useEffect(() => {
    if (!notice) return;
    const id = notice.id;
    const timer = window.setTimeout(() => {
      if (useMessenger.getState().notice?.id === id) dismissNotice();
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const state = useMessenger.getState();
      if (state.threadSearchOpen) {
        setThreadSearchOpen(false);
        return;
      }
      if (state.selectedMessageId) {
        selectMessage(null);
        return;
      }
      if (state.panel === "profile") {
        openPanel("settings");
        return;
      }
      if (state.panel !== "none") {
        openPanel("none");
        return;
      }
      if (state.mobileThread && !window.matchMedia("(min-width: 880px)").matches) closeThread();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeThread, openPanel, selectMessage, setThreadSearchOpen]);

  const threadOpen = mobileThread && panel === "none";

  return (
    <main className={`app${threadOpen ? " is-thread" : ""}${panel !== "none" ? " is-settings" : ""}`}>
      <div className="sr-only" aria-live="polite">
        {live}
      </div>
      {notice ? (
        <div className="notice" role="status">
          <button
            type="button"
            className="notice-body"
            onClick={() => {
              if (notice.chatId) selectChat(notice.chatId);
              dismissNotice();
            }}
          >
            <strong>{notice.title}</strong>
            <span>{notice.body}</span>
          </button>
          <button type="button" className="icon-btn" aria-label="Dismiss" onClick={dismissNotice}>
            <X />
          </button>
        </div>
      ) : null}
      <aside className="sidebar">
        <Sidebar />
      </aside>
      <Stage />
    </main>
  );
}
