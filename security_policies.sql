-- SECURITY HARDENING SCRIPT
-- Run this in Supabase SQL Editor

-- 1. RESET EXISTING POLICIES (Start Fresh)
drop policy if exists "Public messages are viewable by everyone" on public.messages;
drop policy if exists "Anyone can insert messages" on public.messages;
drop policy if exists "Nudges are viewable by everyone" on public.nudges;
drop policy if exists "Anyone can insert nudges" on public.nudges;
drop policy if exists "Anyone can update nudges" on public.nudges;

-- 2. MESSAGES: IMMUTABLE HISTORY
-- Goal: Prevent anyone (even the sender) from deleting or changing history.
-- DENY INSERT (Chatting) - Now handled by Backend Relay
-- create policy "Enable insert for everyone" on public.messages for insert with check (true);
create policy "Deny insert for everyone" on public.messages for insert with check (false);

-- Allow SELECT (Reading)
-- Ideally, we would restrict Private messages here, but without Supabase Auth (JWT),
-- we can't easily check "auth.uid()". 
-- So we allow reading all messages, BUT the Frontend filters them.
-- This is "Obscurity", not "Security", but acceptable for V1 Demo.
create policy "Enable select for everyone" on public.messages for select using (true);

-- DENY UPDATE/DELETE
-- By NOT creating policies for UPDATE or DELETE, they are automatically DENIED for the anon role.
-- This ensures Chat History is Immutable.

-- 3. NUDGES: INVITATION FLOW
-- DENY INSERT (Sending invites) - Now handled by Backend Relay
create policy "Deny insert for nudges" on public.nudges for insert with check (false);

-- Allow SELECT (Viewing invites)
create policy "Enable select for nudges" on public.nudges for select using (true);

-- Allow UPDATE (Accepting/Rejecting)
-- We must allow this so users can respond.
create policy "Enable update for nudges" on public.nudges for update using (true);

-- 4. USERS: PROFILE SYNC
-- We already have policies for this, but let's reinforce.
-- Users need to upsert their own profile.
drop policy if exists "Users can update their own profile" on public.users;
create policy "Enable update for users" on public.users for update using (true);

-- SUMMARY
-- 1. Chat History is now READ-ONLY (after insert). No deletions.
-- 2. Profiles and Nudges are open to updates (required for app flow).
-- 3. To lock this down further (e.g. "Only Paul can update Paul"), 
--    we MUST integrate Supabase Auth with Web3Auth (Phase 4).
