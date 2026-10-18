import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Copy,
  CornerUpLeft,
  MoreVertical,
  Pencil,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { cx, formatClock, formatDayLabel, presenceLine, sameDay } from "@/lib/messenger/format";
import { useMessenger } from "@/lib/messenger/store";
import type { Chat, Message } from "@/lib/messenger/types";
import { Avatar, MessageText, Status } from "./ui";

export function Stage() {
  const chat = useMessenger((s) => s.chats.find((c) => c.id === s.activeChatId) ?? null);
  if (!chat) {
    return (
      <section className="stage">
        <div className="empty-stage">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M5 6.2A3.2 3.2 0 0 1 8.2 3h7.6A3.2 3.2 0 0 1 19 6.2v6.3a3.2 3.2 0 0 1-3.2 3.2h-3.1L8.4 19.6c-.7.55-1.7.05-1.7-.8v-3.1A3.2 3.2 0 0 1 5 12.5V6.2Z"
              />
            </svg>
          </div>
          <h2>Your conversations</h2>
          <p>Choose someone from the list, or start a chat from their username. Messages are delivered to their account.</p>
        </div>
      </section>
    );
  }
  return <Thread chat={chat} />;
}

function Thread({ chat }: { chat: Chat }) {
  const profile = useMessenger((s) => s.profile);
  const settings = useMessenger((s) => s.settings);
  const draft = useMessenger((s) => s.drafts[chat.id] ?? "");
  const replyId = useMessenger((s) => s.replyTo[chat.id] ?? null);
  const editingId = useMessenger((s) => s.editingId);
  const selectedId = useMessenger((s) => s.selectedMessageId);
  const threadSearchOpen = useMessenger((s) => s.threadSearchOpen);
  const threadQuery = useMessenger((s) => s.threadQuery);
  const threadReady = useMessenger((s) => s.threadReadyId === chat.id);
  const closeThread = useMessenger((s) => s.closeThread);
  const setDraft = useMessenger((s) => s.setDraft);
  const setReplyTo = useMessenger((s) => s.setReplyTo);
  const selectMessage = useMessenger((s) => s.selectMessage);
  const startEdit = useMessenger((s) => s.startEdit);
  const cancelEdit = useMessenger((s) => s.cancelEdit);
  const commitEdit = useMessenger((s) => s.commitEdit);
  const deleteMessage = useMessenger((s) => s.deleteMessage);
  const sendMessage = useMessenger((s) => s.sendMessage);
  const togglePin = useMessenger((s) => s.togglePin);
  const toggleMute = useMessenger((s) => s.toggleMute);
  const markUnread = useMessenger((s) => s.markUnread);
  const setThreadSearchOpen = useMessenger((s) => s.setThreadSearchOpen);
  const setThreadQuery = useMessenger((s) => s.setThreadQuery);
  const flash = useMessenger((s) => s.flash);

  const [menu, setMenu] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [showJump, setShowJump] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickRef = useRef(true);

  const query = threadQuery.trim().toLowerCase();
  const shown = query ? chat.messages.filter((m) => m.text.toLowerCase().includes(query)) : chat.messages;
  const selected = chat.messages.find((m) => m.id === selectedId) ?? null;
  const editing = chat.messages.find((m) => m.id === editingId) ?? null;
  const reply = chat.messages.find((m) => m.id === replyId) ?? null;
  const presence = presenceLine(chat, settings.showLastSeen);
  const live = chat.typing || (chat.online && chat.kind !== "saved");

  useEffect(() => {
    setMenu(false);
    setContactOpen(false);
    stickRef.current = true;
    setShowJump(false);
  }, [chat.id]);

  useEffect(() => {
    if (!editingId) return;
    const message = useMessenger
      .getState()
      .chats.flatMap((item) => item.messages)
      .find((item) => item.id === editingId);
    if (message) setEditText(message.text);
  }, [editingId]);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [chat.id, shown.length, chat.typing, editingId]);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 880px)").matches) return;
    if (!selected && !threadSearchOpen) inputRef.current?.focus();
  }, [chat.id, selected, threadSearchOpen]);

  useEffect(() => {
    if (!menu) return;
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [menu]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menu || contactOpen || selectedId) {
        setMenu(false);
        setContactOpen(false);
        selectMessage(null);
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu, contactOpen, selectedId, selectMessage]);

  function resizeInput() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 136)}px`;
  }

  useLayoutEffect(() => {
    resizeInput();
  }, [draft, editText, editingId, chat.id]);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
    stickRef.current = near;
    setShowJump((value) => (value === !near ? value : !near));
  }

  function submit() {
    if (editing) {
      commitEdit(chat.id, editing.id, editText);
      return;
    }
    const text = draft.trim();
    if (!text) return;
    stickRef.current = true;
    sendMessage(chat.id, text);
  }

  async function copySelected() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.text);
      flash("Copied", "Message copied.");
    } catch {
      flash("Couldn’t copy", "Clipboard isn’t available in this view.");
    }
    selectMessage(null);
  }

  return (
    <section className="stage thread" data-size={settings.textSize}>
      <header className="thread-head">
        <button type="button" className="icon-btn back-btn" aria-label="Back to chats" onClick={closeThread}>
          <ArrowLeft />
        </button>
        <button type="button" className="identity" onClick={() => setContactOpen((v) => !v)}>
          <Avatar
            name={chat.name}
            tone={chat.tone}
            size="sm"
            saved={chat.kind === "saved"}
            online={chat.online}
          />
          <span className="row-main">
            <h2>{chat.name}</h2>
            <p className={cx("sub", live && "live")}>{presence}</p>
          </span>
        </button>
        <div className="head-actions" ref={menuRef}>
          <button
            type="button"
            className="icon-btn"
            aria-label="Search in chat"
            onClick={() => setThreadSearchOpen(!threadSearchOpen)}
          >
            <Search />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Chat actions"
            aria-expanded={menu}
            onClick={() => {
              setMenu((v) => !v);
            }}
          >
            <MoreVertical />
          </button>
          {menu ? (
            <div className="menu" role="menu">
              <button type="button" className="menu-item" role="menuitem" onClick={() => { togglePin(chat.id); setMenu(false); }}>
                {chat.pinned ? "Unpin" : "Pin"}
              </button>
              <button type="button" className="menu-item" role="menuitem" onClick={() => { toggleMute(chat.id); setMenu(false); }}>
                {chat.muted ? "Unmute" : "Mute"}
              </button>
              <button
                type="button"
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  markUnread(chat.id);
                  setMenu(false);
                  closeThread();
                }}
              >
                Mark unread
              </button>
            </div>
          ) : null}
        </div>
      </header>
      {threadSearchOpen ? (
        <div className="thread-search">
          <Search aria-hidden="true" />
          <input
            autoFocus
            value={threadQuery}
            placeholder="Search this chat"
            onChange={(e) => setThreadQuery(e.target.value)}
          />
          <button type="button" className="icon-btn" aria-label="Close search" onClick={() => setThreadSearchOpen(false)}>
            <X />
          </button>
        </div>
      ) : null}
      <div
        className={cx("transcript", settings.wallpaper)}
        ref={scrollerRef}
        onScroll={onScroll}
      >
        <div
          className="thread-col"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) selectMessage(null);
          }}
        >
          {shown.length === 0 ? (
            <p className="no-match">
              {query ? "No messages match." : threadReady ? "No messages yet. Say hello." : "Loading messages"}
            </p>
          ) : null}
          {shown.map((message, index) => {
            const prev = shown[index - 1];
            const showDay = !prev || !sameDay(prev.createdAt, message.createdAt);
            const grouped = Boolean(
              prev &&
                !showDay &&
                prev.from === message.from &&
                message.createdAt - prev.createdAt < 5 * 60_000,
            );
            const quoted = message.replyToId
              ? chat.messages.find((item) => item.id === message.replyToId)
              : undefined;
            return (
              <MessageRow
                key={message.id}
                message={message}
                chat={chat}
                mineName={profile.name}
                grouped={grouped}
                showDay={showDay}
                selected={message.id === selectedId}
                linkify={settings.previewLinks}
                quoted={quoted}
                onSelect={() => selectMessage(message.id === selectedId ? null : message.id)}
              />
            );
          })}
          {chat.typing && !query ? (
            <div className="msg-row">
              <div className="bubble in typing-bubble" aria-label={`${chat.name} is typing`}>
                <span className="dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="typing-label">typing</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {showJump ? (
        <button
          type="button"
          className="jump"
          onClick={() => {
            stickRef.current = true;
            const el = scrollerRef.current;
            if (el) el.scrollTop = el.scrollHeight;
            setShowJump(false);
          }}
        >
          Latest
        </button>
      ) : null}
      {contactOpen ? (
        <div className="contact-card">
          <Avatar name={chat.name} tone={chat.tone} size="lg" saved={chat.kind === "saved"} online={chat.online} />
          <h2>{chat.name}</h2>
          <p className="handle">@{chat.username}</p>
          <p className="bio">{chat.bio}</p>
          <button type="button" className="btn-ghost" onClick={() => setContactOpen(false)}>
            Back to messages
          </button>
        </div>
      ) : null}
      {selected ? (
        <div className={cx("action-bar", selected.from === "me" && "four")}>
          <button
            type="button"
            className="action-btn"
            onClick={() => {
              setReplyTo(chat.id, selected.id);
              selectMessage(null);
              inputRef.current?.focus();
            }}
          >
            <CornerUpLeft />
            Reply
          </button>
          <button type="button" className="action-btn" onClick={() => void copySelected()}>
            <Copy />
            Copy
          </button>
          {selected.from === "me" ? (
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                startEdit(selected.id);
                inputRef.current?.focus();
              }}
            >
              <Pencil />
              Edit
            </button>
          ) : null}
          <button
            type="button"
            className="action-btn danger"
            onClick={() => deleteMessage(chat.id, selected.id)}
          >
            <Trash2 />
            Delete
          </button>
        </div>
      ) : (
        <form
          className="composer-wrap"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {editing ? (
            <div className="edit-bar">
              <div className="reply-copy">
                <span className="quote-name">Edit message</span>
                <span className="quote-text">{editing.text}</span>
              </div>
              <button type="button" className="icon-btn" aria-label="Cancel edit" onClick={cancelEdit}>
                <X />
              </button>
            </div>
          ) : null}
          {reply && !editing ? (
            <div className="reply-bar">
              <div className="reply-copy">
                <span className="quote-name">{reply.from === "me" ? profile.name : chat.name}</span>
                <span className="quote-text">{reply.text}</span>
              </div>
              <button type="button" className="icon-btn" aria-label="Cancel reply" onClick={() => setReplyTo(chat.id, null)}>
                <X />
              </button>
            </div>
          ) : null}
          <div className="composer-shell">
            <textarea
              ref={inputRef}
              className="composer-input"
              rows={1}
              placeholder={chat.kind === "saved" ? "Write a note" : "Message"}
              value={editing ? editText : draft}
              enterKeyHint="send"
              onChange={(event) => {
                if (editing) setEditText(event.target.value);
                else setDraft(chat.id, event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const command = event.metaKey || event.ctrlKey;
                if (event.shiftKey) return;
                if (settings.sendWithEnter || command) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
            <button
              type="submit"
              className="send-btn"
              aria-label={editing ? "Save edit" : "Send"}
              disabled={editing ? !editText.trim() : !draft.trim()}
            >
              {editing ? <Pencil /> : <Send />}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function MessageRow({
  message,
  chat,
  mineName,
  grouped,
  showDay,
  selected,
  linkify,
  quoted,
  onSelect,
}: {
  message: Message;
  chat: Chat;
  mineName: string;
  grouped: boolean;
  showDay: boolean;
  selected: boolean;
  linkify: boolean;
  quoted?: Message;
  onSelect: () => void;
}) {
  const statusLabel =
    message.from === "me"
      ? message.status === "sending"
        ? "Sending"
        : message.status === "sent"
          ? "Sent"
          : message.status === "delivered"
            ? "Delivered"
            : "Read"
      : "Received";
  return (
    <>
      {showDay ? <div className="day-chip">{formatDayLabel(message.createdAt)}</div> : null}
      <div className={cx("msg-row", message.from === "me" && "mine", grouped && "grouped", selected && "is-selected")}>
        <button
          type="button"
          id={`msg-${message.id}`}
          className={cx("bubble", message.from === "me" ? "out" : "in")}
          onClick={onSelect}
        >
          {quoted ? (
            <span className="quote">
              <span className="quote-name">{quoted.from === "me" ? mineName : chat.name}</span>
              <span className="quote-text">{quoted.text}</span>
            </span>
          ) : null}
          <span className="bubble-text">
            <MessageText text={message.text} linkify={linkify} />
          </span>
          <span className="meta">
            {message.edited ? <span className="edited">edited</span> : null}
            <time dateTime={new Date(message.createdAt).toISOString()}>{formatClock(message.createdAt)}</time>
            {message.from === "me" ? <Status status={message.status} /> : null}
            <span className="sr-only">{statusLabel}</span>
          </span>
        </button>
      </div>
    </>
  );
}
