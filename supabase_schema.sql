-- 1. USERS TABLE
create table public.users (
  id text primary key, -- We will use the Web3Auth Wallet Address or ID as the PK
  name text not null,
  avatar text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. MESSAGES TABLE (Chat)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  hotel_id text not null, -- "hotel_123"
  user_id text not null references public.users(id),
  user_name text not null,
  user_avatar text,
  text text,
  image text, -- URL to image
  is_private boolean default false,
  recipient_id text, -- If private, who is it for?
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. NUDGES TABLE (Invitations)
create table public.nudges (
  id uuid default gen_random_uuid() primary key,
  from_user_id text not null references public.users(id),
  to_user_id text not null references public.users(id),
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ENABLE REALTIME
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.nudges;

-- 5. ROW LEVEL SECURITY (RLS) - LOCKED DOWN (PRODUCTION)
-- Public Read (for MVP simplicity), but WRITES are strictly Backend-Only (Service Role).

alter table public.users enable row level security;
-- READ: Everyone can see basic profiles (needed for picking users in lobby)
create policy "Public users are viewable by everyone" on public.users for select using (true);
-- WRITE: DENY ALL (Service Role bypasses RLS automatically)

alter table public.messages enable row level security;
-- READ: Everyone can see messages (in their lobby)
create policy "Public messages are viewable by everyone" on public.messages for select using (true);
-- WRITE: DENY ALL (Service Role bypasses RLS)

alter table public.nudges enable row level security;
-- READ: Everyone can see nudges (client filters for "my" nudges)
create policy "Nudges are viewable by everyone" on public.nudges for select using (true);
-- WRITE: DENY ALL (Service Role bypasses RLS)

alter table public.push_subscriptions enable row level security;
-- READ: Public? No, actually, only the backend needs to read this to send pushes. 
-- BUT: For simplicity in this MVP, we might keep it restricted or just deny all access if client never reads it.
-- Client NEVER reads subscriptions. Only writes.
-- Since writes are now Backend-Only, we can deny ALL public access to this table.
-- create policy "No public access" ... (Default behavior is deny)

-- 6. PUSH SUBSCRIPTIONS
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null references public.users(id),
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;
-- DENY ALL PUBLIC ACCESS (Implicit)
