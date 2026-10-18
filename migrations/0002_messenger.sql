-- Real accounts, direct chats, and messages. Scoped to the signed-in user in server functions.

create table if not exists profiles (
  user_id text primary key references "user"(id) on delete cascade,
  name text not null,
  username text not null,
  bio text not null default '',
  tone int not null default 0,
  read_receipts boolean not null default true,
  show_last_seen boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on profiles (lower(username));

create table if not exists conversations (
  id text primary key,
  kind text not null check (kind in ('direct', 'saved')),
  created_at timestamptz not null default now()
);

create table if not exists members (
  conversation_id text not null references conversations(id) on delete cascade,
  user_id text not null references profiles(user_id) on delete cascade,
  pinned boolean not null default false,
  muted boolean not null default false,
  read_cursor timestamptz not null default now(),
  receipt_at timestamptz not null default now(),
  typing_until timestamptz,
  primary key (conversation_id, user_id)
);

create index if not exists members_user_idx on members (user_id);

create table if not exists messages (
  id text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  sender_id text not null references profiles(user_id) on delete cascade,
  body text not null,
  reply_to_id text,
  edited boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_created_idx on messages (conversation_id, created_at);
