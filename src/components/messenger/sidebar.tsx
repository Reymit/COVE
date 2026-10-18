import { useEffect, useState } from "react";
import { ArrowLeft, BellOff, Pin, Search, SquarePen, X } from "lucide-react";
import {
  chatVisible,
  cx,
  formatListTime,
  lastActivity,
  lastPreview,
  searchPreview,
  sortChats,
  unreadCount,
} from "@/lib/messenger/format";
import { useMessenger } from "@/lib/messenger/store";
import type { Chat, Folder, Person } from "@/lib/messenger/types";
import { SettingsPanel } from "./settings-panel";
import { Avatar, Mark } from "./ui";

const FOLDERS: { id: Folder; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
];

export function Sidebar() {
  const panel = useMessenger((s) => s.panel);
  if (panel === "people") return <PeoplePanel />;
  if (panel !== "none") return <SettingsPanel />;
  return <ChatList />;
}

function ChatList() {
  const profile = useMessenger((s) => s.profile);
  const chats = useMessenger((s) => s.chats);
  const folder = useMessenger((s) => s.folder);
  const listQuery = useMessenger((s) => s.listQuery);
  const drafts = useMessenger((s) => s.drafts);
  const activeChatId = useMessenger((s) => s.activeChatId);
  const openPanel = useMessenger((s) => s.openPanel);
  const setFolder = useMessenger((s) => s.setFolder);
  const setListQuery = useMessenger((s) => s.setListQuery);
  const selectChat = useMessenger((s) => s.selectChat);

  const rows = sortChats(chats).filter((chat) => chatVisible(chat, folder, listQuery));
  const pinned = rows.filter((chat) => chat.pinned);
  const rest = rows.filter((chat) => !chat.pinned);
  const showHeads = pinned.length > 0 && rest.length > 0;

  return (
    <>
      <header className="side-head">
        <button
          type="button"
          className="me-btn"
          aria-label={`${profile.name}, open settings`}
          onClick={() => openPanel("settings")}
        >
          <Avatar name={profile.name} tone={profile.tone} size="sm" />
        </button>
        <div className="brand">
          <Mark />
          <h1>Cove</h1>
        </div>
        <button type="button" className="icon-btn" aria-label="New chat" onClick={() => openPanel("people")}>
          <SquarePen />
        </button>
      </header>
      <div className="search-wrap">
        <Search aria-hidden="true" />
        <input
          id="chat-search"
          value={listQuery}
          placeholder="Search"
          autoComplete="off"
          onChange={(e) => setListQuery(e.target.value)}
        />
        {listQuery ? (
          <button type="button" className="icon-btn" aria-label="Clear search" onClick={() => setListQuery("")}>
            <X />
          </button>
        ) : null}
      </div>
      <div className="folders" role="tablist" aria-label="Folders">
        {FOLDERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={folder === item.id}
            className={cx("folder-btn", folder === item.id && "is-on")}
            onClick={() => setFolder(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="chat-scroll">
        {rows.length === 0 ? (
          <div className="empty-list">
            <strong>{listQuery ? "No chats match" : "You’re caught up"}</strong>
            <p>
              {listQuery
                ? "Try a name or a username."
                : folder === "unread"
                  ? "Nothing unread."
                  : "No chats yet. Tap the new-chat button and search a username."}
            </p>
          </div>
        ) : (
          <>
            {showHeads ? <p className="section-label">Pinned</p> : null}
            {pinned.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                query={listQuery}
                draft={drafts[chat.id] ?? ""}
                active={chat.id === activeChatId}
                onOpen={() => selectChat(chat.id)}
              />
            ))}
            {showHeads ? <p className="section-label">Chats</p> : null}
            {rest.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                query={listQuery}
                draft={drafts[chat.id] ?? ""}
                active={chat.id === activeChatId}
                onOpen={() => selectChat(chat.id)}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}

function PeoplePanel() {
  const openPanel = useMessenger((s) => s.openPanel);
  const findPeople = useMessenger((s) => s.findPeople);
  const startChat = useMessenger((s) => s.startChat);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Person[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    if (!q) {
      setHits([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    const timer = window.setTimeout(() => {
      void findPeople(q)
        .then((rows) => {
          if (!cancelled) setHits(rows);
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [findPeople, query]);

  return (
    <>
      <header className="panel-head">
        <button type="button" className="icon-btn" aria-label="Back to chats" onClick={() => openPanel("none")}>
          <ArrowLeft />
        </button>
        <h1>New chat</h1>
      </header>
      <div className="search-wrap">
        <Search aria-hidden="true" />
        <input
          value={query}
          placeholder="Search username or name"
          autoComplete="off"
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="chat-scroll">
        {!query.trim() ? (
          <div className="empty-list">
            <strong>Find an account</strong>
            <p>Other people create an account, then you search the username they chose.</p>
          </div>
        ) : hits.length === 0 ? (
          <div className="empty-list">
            <strong>{busy ? "Searching" : "No accounts match"}</strong>
            <p>{busy ? "Looking up that name." : "Ask them to sign up and share their username."}</p>
          </div>
        ) : (
          hits.map((person) => (
            <button
              key={person.username}
              type="button"
              className="chat-row"
              onClick={() => void startChat(person.username)}
            >
              <Avatar name={person.name} tone={person.tone} size="md" />
              <span className="row-main">
                <span className="row-top">
                  <span className="row-name">{person.name}</span>
                </span>
                <span className="row-bottom">
                  <span className="preview">@{person.username}</span>
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </>
  );
}

function ChatRow({
  chat,
  query,
  draft,
  active,
  onOpen,
}: {
  chat: Chat;
  query: string;
  draft: string;
  active: boolean;
  onOpen: () => void;
}) {
  const unread = unreadCount(chat);
  const found = searchPreview(chat, query);
  const draftText = draft.trim();
  const hot = Boolean(chat.typing || (draftText && !found));
  const preview = chat.typing
    ? "typing…"
    : found
      ? found
      : draftText
        ? `Draft: ${draftText}`
        : lastPreview(chat);
  const when = lastActivity(chat);

  return (
    <button type="button" className={cx("chat-row", active && "is-active")} onClick={onOpen}>
      <Avatar
        name={chat.name}
        tone={chat.tone}
        size="md"
        saved={chat.kind === "saved"}
        online={chat.online}
      />
      <span className="row-main">
        <span className="row-top">
          <span className="row-name">{chat.name}</span>
          {when ? <span className="row-time">{formatListTime(when)}</span> : null}
        </span>
        <span className="row-bottom">
          <span className={cx("preview", hot && "preview-hot")}>{preview}</span>
          <span className="row-icons">
            {chat.pinned ? <Pin className="pin-icon" aria-label="Pinned" /> : null}
            {chat.muted ? <BellOff className="mute-icon" aria-label="Muted" /> : null}
            {unread > 0 ? (
              <span className={cx("badge", chat.muted && "muted")}>{unread > 99 ? "99+" : unread}</span>
            ) : null}
          </span>
        </span>
      </span>
    </button>
  );
}
