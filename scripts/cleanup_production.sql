-- ⚠️ PRODUCTION ACCESS REQUIRED
-- Run this script in your Supabase SQL Editor to wipe all chat history.

-- 1. Delete all messages (Cascades if configured, otherwise simple delete)
TRUNCATE TABLE public.messages;

-- 2. Delete all nudges (invitations)
TRUNCATE TABLE public.nudges;

-- 3. (Optional) Delete push subscriptions if you want a TRULY fresh start
-- TRUNCATE TABLE public.push_subscriptions;

SELECT 'Chat history successfully wiped' as status;
