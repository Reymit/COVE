import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Message, Person, Profile } from "./types";

type ChatRow = {
  id: string;
  kind: "direct" | "saved";
  name: string;
  username: string;
  bio: string;
  tone: number;
  online: boolean;
  lastSeen: number;
  pinned: boolean;
  muted: boolean;
  typing: boolean;
  unread: number;
  preview: string;
  previewMine: boolean;
  previewAt: number;
  lastReadAt: number;
};

export type SyncPayload = {
  profile: Profile | null;
  readReceipts: boolean;
  showLastSeen: boolean;
  chats: ChatRow[];
  messages: Message[];
};

const USERNAME = /^[a-z0-9_]{3,20}$/;

function num(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function cleanUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

function likePattern(value: string) {
  return `%${value.toLowerCase().replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

async function sql() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

export const syncInbox = createServerFn({ method: "POST" })
  .validator((input: { conversationId?: string | null }) => ({
    conversationId: input?.conversationId || null,
  }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<SyncPayload> => {
    const db = await sql();
    const userId = context.userId;
    await db`update profiles set last_seen_at = now() where user_id = ${userId}`;

    const profiles = await db<{
      name: string;
      username: string;
      bio: string;
      tone: number;
      read_receipts: boolean;
      show_last_seen: boolean;
    }>`
      select name, username, bio, tone, read_receipts, show_last_seen
      from profiles
      where user_id = ${userId}
    `;
    const me = profiles[0];
    if (!me) {
      return { profile: null, readReceipts: true, showLastSeen: true, chats: [], messages: [] };
    }

    const saved = await db<{ id: string }>`
      select c.id
      from conversations c
      join members m on m.conversation_id = c.id and m.user_id = ${userId}
      where c.kind = 'saved'
      limit 1
    `;
    if (!saved.length) {
      const savedId = crypto.randomUUID();
      await db`insert into conversations (id, kind) values (${savedId}, 'saved')`;
      await db`insert into members (conversation_id, user_id) values (${savedId}, ${userId})`;
    }

    const rows = await db<{
      id: string;
      kind: string;
      pinned: boolean;
      muted: boolean;
      read_ms: unknown;
      peer_name: string | null;
      peer_username: string | null;
      peer_bio: string | null;
      peer_tone: number | null;
      peer_show_last_seen: boolean | null;
      peer_last_seen_ms: unknown;
      peer_typing: boolean | null;
      unread: number;
      preview: string | null;
      preview_mine: boolean | null;
      preview_ms: unknown;
    }>`
      select
        c.id,
        c.kind,
        me.pinned,
        me.muted,
        (extract(epoch from me.read_cursor) * 1000)::float8 as read_ms,
        p.name as peer_name,
        p.username as peer_username,
        p.bio as peer_bio,
        p.tone as peer_tone,
        p.show_last_seen as peer_show_last_seen,
        (extract(epoch from p.last_seen_at) * 1000)::float8 as peer_last_seen_ms,
        (peer.typing_until is not null and peer.typing_until > now()) as peer_typing,
        coalesce(u.unread, 0)::int as unread,
        last.body as preview,
        (last.sender_id = ${userId}) as preview_mine,
        (extract(epoch from last.created_at) * 1000)::float8 as preview_ms
      from conversations c
      join members me on me.conversation_id = c.id and me.user_id = ${userId}
      left join members peer on peer.conversation_id = c.id and peer.user_id <> ${userId}
      left join profiles p on p.user_id = peer.user_id
      left join lateral (
        select body, sender_id, created_at
        from messages
        where conversation_id = c.id
        order by created_at desc
        limit 1
      ) last on true
      left join lateral (
        select count(*)::int as unread
        from messages
        where conversation_id = c.id
          and sender_id <> ${userId}
          and created_at > me.read_cursor
      ) u on true
      where c.kind = 'saved' or p.user_id is not null
    `;

    const chats: ChatRow[] = rows.map((row) => {
      const saved = row.kind === "saved";
      const hidden = !saved && row.peer_show_last_seen === false;
      const lastSeen = hidden ? 0 : num(row.peer_last_seen_ms);
      return {
        id: row.id,
        kind: saved ? "saved" : "direct",
        name: saved ? "Saved messages" : (row.peer_name ?? "Unknown"),
        username: saved ? "saved" : (row.peer_username ?? "unknown"),
        bio: saved ? "Notes just for you." : (row.peer_bio ?? ""),
        tone: saved ? 0 : num(row.peer_tone),
        online: !saved && !hidden && Date.now() - lastSeen < 45_000,
        lastSeen,
        pinned: row.pinned,
        muted: row.muted,
        typing: !saved && Boolean(row.peer_typing),
        unread: num(row.unread),
        preview: row.preview ?? "",
        previewMine: Boolean(row.preview_mine),
        previewAt: num(row.preview_ms),
        lastReadAt: num(row.read_ms),
      };
    });

    let messages: Message[] = [];
    if (data.conversationId && chats.some((chat) => chat.id === data.conversationId)) {
      const messageRows = await db<{
        id: string;
        body: string;
        sender_id: string;
        edited: boolean;
        reply_to_id: string | null;
        created_ms: unknown;
        status: string;
      }>`
        select * from (
          select
            m.id,
            m.body,
            m.sender_id,
            m.edited,
            m.reply_to_id,
            (extract(epoch from m.created_at) * 1000)::float8 as created_ms,
            case
              when c.kind = 'saved' then 'read'
              when m.sender_id <> ${userId} then 'delivered'
              when peer_prof.read_receipts is true and peer.receipt_at >= m.created_at then 'read'
              else 'delivered'
            end as status
          from messages m
          join conversations c on c.id = m.conversation_id
          join members me on me.conversation_id = c.id and me.user_id = ${userId}
          left join members peer on peer.conversation_id = c.id and peer.user_id <> ${userId}
          left join profiles peer_prof on peer_prof.user_id = peer.user_id
          where m.conversation_id = ${data.conversationId}
          order by m.created_at desc
          limit 400
        ) recent
        order by created_ms asc
      `;
      messages = messageRows.map((row) => ({
        id: row.id,
        from: row.sender_id === userId ? "me" : "them",
        text: row.body,
        createdAt: num(row.created_ms),
        status: row.status === "read" ? "read" : "delivered",
        replyToId: row.reply_to_id ?? undefined,
        edited: row.edited || undefined,
      }));
    }

    return {
      profile: { name: me.name, username: me.username, bio: me.bio, tone: num(me.tone) },
      readReceipts: me.read_receipts,
      showLastSeen: me.show_last_seen,
      chats,
      messages,
    };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .validator((input: { name: string; username: string; bio: string; tone: number }) => {
    const name = input.name.trim().slice(0, 40);
    const username = cleanUsername(input.username);
    const bio = input.bio.trim().slice(0, 140);
    const tone = Math.max(0, Math.min(5, Math.round(input.tone) || 0));
    if (!name) throw new Error("Name is required.");
    if (!USERNAME.test(username)) throw new Error("Username must be 3–20 letters, numbers, or underscores.");
    return { name, username, bio, tone };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const db = await sql();
    const userId = context.userId;
    const taken = await db<{ user_id: string }>`
      select user_id from profiles
      where lower(username) = ${data.username} and user_id <> ${userId}
    `;
    if (taken.length) return { ok: false as const, error: "That username is taken." };

    const existing = await db<{ user_id: string }>`select user_id from profiles where user_id = ${userId}`;
    if (existing.length) {
      await db`
        update profiles
        set name = ${data.name}, username = ${data.username}, bio = ${data.bio}, tone = ${data.tone}
        where user_id = ${userId}
      `;
    } else {
      await db`
        insert into profiles (user_id, name, username, bio, tone)
        values (${userId}, ${data.name}, ${data.username}, ${data.bio}, ${data.tone})
      `;
      const savedId = crypto.randomUUID();
      await db`insert into conversations (id, kind) values (${savedId}, 'saved')`;
      await db`insert into members (conversation_id, user_id) values (${savedId}, ${userId})`;
    }
    return { ok: true as const, error: "" };
  });

export const updatePrivacy = createServerFn({ method: "POST" })
  .validator((input: { readReceipts: boolean; showLastSeen: boolean }) => ({
    readReceipts: Boolean(input.readReceipts),
    showLastSeen: Boolean(input.showLastSeen),
  }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const db = await sql();
    await db`
      update profiles
      set read_receipts = ${data.readReceipts}, show_last_seen = ${data.showLastSeen}
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const searchPeople = createServerFn({ method: "POST" })
  .validator((query: string) => query.trim().slice(0, 40))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Person[]> => {
    if (data.length < 1) return [];
    const db = await sql();
    const rows = await db<{ name: string; username: string; bio: string; tone: number }>`
      select name, username, bio, tone
      from profiles
      where user_id <> ${context.userId}
        and (lower(username) like ${likePattern(data)} escape '\\' or lower(name) like ${likePattern(data)} escape '\\')
      order by username
      limit 12
    `;
    return rows.map((row) => ({
      name: row.name,
      username: row.username,
      bio: row.bio,
      tone: num(row.tone),
    }));
  });

export const startDirect = createServerFn({ method: "POST" })
  .validator((username: string) => cleanUsername(username))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!USERNAME.test(data)) return { ok: false as const, error: "Enter a username.", conversationId: "" };
    const db = await sql();
    const userId = context.userId;
    const people = await db<{ user_id: string }>`
      select user_id from profiles where lower(username) = ${data} and user_id <> ${userId}
    `;
    const other = people[0];
    if (!other) return { ok: false as const, error: "No account uses that username.", conversationId: "" };

    const existing = await db<{ id: string }>`
      select c.id
      from conversations c
      join members a on a.conversation_id = c.id and a.user_id = ${userId}
      join members b on b.conversation_id = c.id and b.user_id = ${other.user_id}
      where c.kind = 'direct'
      limit 1
    `;
    if (existing[0]) return { ok: true as const, error: "", conversationId: existing[0].id };

    const id = crypto.randomUUID();
    await db`insert into conversations (id, kind) values (${id}, 'direct')`;
    await db`insert into members (conversation_id, user_id) values (${id}, ${userId})`;
    await db`insert into members (conversation_id, user_id) values (${id}, ${other.user_id})`;
    return { ok: true as const, error: "", conversationId: id };
  });

async function memberKind(userId: string, conversationId: string) {
  const db = await sql();
  const rows = await db<{ kind: string }>`
    select c.kind
    from conversations c
    join members m on m.conversation_id = c.id and m.user_id = ${userId}
    where c.id = ${conversationId}
  `;
  return rows[0]?.kind ?? null;
}

export const sendMessage = createServerFn({ method: "POST" })
  .validator((input: { conversationId: string; text: string; replyToId?: string | null }) => {
    const text = input.text.trim();
    if (!input.conversationId) throw new Error("Missing chat.");
    if (!text || text.length > 4000) throw new Error("Message is empty or too long.");
    return { conversationId: input.conversationId, text, replyToId: input.replyToId || null };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Message> => {
    const kind = await memberKind(context.userId, data.conversationId);
    if (!kind) throw new Error("You are not in that chat.");
    const db = await sql();
    const id = crypto.randomUUID();
    await db`
      insert into messages (id, conversation_id, sender_id, body, reply_to_id)
      values (${id}, ${data.conversationId}, ${context.userId}, ${data.text}, ${data.replyToId})
    `;
    await db`
      update members set typing_until = null
      where conversation_id = ${data.conversationId} and user_id = ${context.userId}
    `;
    const rows = await db<{ created_ms: unknown }>`
      select (extract(epoch from created_at) * 1000)::float8 as created_ms
      from messages where id = ${id}
    `;
    return {
      id,
      from: "me",
      text: data.text,
      createdAt: num(rows[0]?.created_ms),
      status: kind === "saved" ? "read" : "delivered",
      replyToId: data.replyToId ?? undefined,
    };
  });

export const editMessage = createServerFn({ method: "POST" })
  .validator((input: { conversationId: string; messageId: string; text: string }) => {
    const text = input.text.trim();
    if (!text || text.length > 4000) throw new Error("Message is empty or too long.");
    return { conversationId: input.conversationId, messageId: input.messageId, text };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!(await memberKind(context.userId, data.conversationId))) throw new Error("You are not in that chat.");
    const db = await sql();
    const rows = await db<{ id: string }>`
      update messages set body = ${data.text}, edited = true
      where id = ${data.messageId}
        and conversation_id = ${data.conversationId}
        and sender_id = ${context.userId}
      returning id
    `;
    if (!rows.length) throw new Error("That message cannot be edited.");
    return { ok: true as const };
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .validator((input: { conversationId: string; messageId: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!(await memberKind(context.userId, data.conversationId))) throw new Error("You are not in that chat.");
    const db = await sql();
    await db`
      delete from messages
      where id = ${data.messageId}
        and conversation_id = ${data.conversationId}
        and sender_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const markRead = createServerFn({ method: "POST" })
  .validator((conversationId: string) => conversationId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!(await memberKind(context.userId, data))) return { ok: false as const };
    const db = await sql();
    const prefs = await db<{ read_receipts: boolean }>`
      select read_receipts from profiles where user_id = ${context.userId}
    `;
    if (prefs[0]?.read_receipts) {
      await db`
        update members set read_cursor = now(), receipt_at = now()
        where conversation_id = ${data} and user_id = ${context.userId}
      `;
    } else {
      await db`
        update members set read_cursor = now()
        where conversation_id = ${data} and user_id = ${context.userId}
      `;
    }
    return { ok: true as const };
  });

export const markUnread = createServerFn({ method: "POST" })
  .validator((conversationId: string) => conversationId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!(await memberKind(context.userId, data))) return { ok: false as const };
    const db = await sql();
    await db`
      update members me
      set read_cursor = coalesce(
        (
          select max(created_at) - interval '1 millisecond'
          from messages
          where conversation_id = ${data} and sender_id <> ${context.userId}
        ),
        me.read_cursor
      )
      where me.conversation_id = ${data} and me.user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const setMemberFlags = createServerFn({ method: "POST" })
  .validator((input: { conversationId: string; pinned?: boolean; muted?: boolean }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!(await memberKind(context.userId, data.conversationId))) return { ok: false as const };
    const db = await sql();
    if (typeof data.pinned === "boolean") {
      await db`
        update members set pinned = ${data.pinned}
        where conversation_id = ${data.conversationId} and user_id = ${context.userId}
      `;
    }
    if (typeof data.muted === "boolean") {
      await db`
        update members set muted = ${data.muted}
        where conversation_id = ${data.conversationId} and user_id = ${context.userId}
      `;
    }
    return { ok: true as const };
  });

export const setTyping = createServerFn({ method: "POST" })
  .validator((input: { conversationId: string; typing: boolean }) => ({
    conversationId: input.conversationId,
    typing: Boolean(input.typing),
  }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!(await memberKind(context.userId, data.conversationId))) return { ok: false as const };
    const db = await sql();
    if (data.typing) {
      await db`
        update members set typing_until = now() + interval '8 seconds'
        where conversation_id = ${data.conversationId} and user_id = ${context.userId}
      `;
    } else {
      await db`
        update members set typing_until = null
        where conversation_id = ${data.conversationId} and user_id = ${context.userId}
      `;
    }
    return { ok: true as const };
  });
