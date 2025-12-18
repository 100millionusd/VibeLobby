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

-- 5. ROW LEVEL SECURITY (RLS) - BASIC
-- For now, allow public read/write to get things moving. 
-- In production, we will lock this down.
alter table public.users enable row level security;
create policy "Public users are viewable by everyone" on public.users for select using (true);
create policy "Users can insert their own profile" on public.users for insert with check (true);
create policy "Users can update their own profile" on public.users for update using (true);

alter table public.messages enable row level security;
create policy "Public messages are viewable by everyone" on public.messages for select using (true);
create policy "Anyone can insert messages" on public.messages for insert with check (true);

alter table public.nudges enable row level security;
create policy "Nudges are viewable by everyone" on public.nudges for select using (true);
create policy "Anyone can insert nudges" on public.nudges for insert with check (true);
create policy "Anyone can update nudges" on public.nudges for update using (true);
