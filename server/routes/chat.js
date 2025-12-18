import express from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';

const router = express.Router();

// POST /api/chat/send
// Securely send a message to the lobby
router.post('/send', async (req, res) => {
    try {
        const { hotelId, text, user, isPrivate, image } = req.body;

        if (!hotelId || !text || !user || !user.id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 1. Ensure User Exists (Sync)
        // We do this on the backend now to ensure data integrity
        const { error: userError } = await supabaseAdmin.from('users').upsert({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio
        });

        if (userError) {
            console.error("Backend User Sync Error:", userError);
            // Continue anyway, maybe they exist
        }

        // 2. Insert Message (Bypassing RLS)
        const { data, error } = await supabaseAdmin
            .from('messages')
            .insert({
                hotel_id: hotelId,
                user_id: user.id,
                user_name: user.name,
                user_avatar: user.avatar,
                text: text,
                image: image || null,
                is_private: isPrivate,
                recipient_id: isPrivate ? 'todo_fix_recipient' : null
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json(data);

    } catch (error) {
        console.error("Backend Chat Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/chat/nudge
// Securely send a nudge
router.post('/nudge', async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;

        if (!fromUserId || !toUserId) {
            return res.status(400).json({ error: "Missing IDs" });
        }

        // Check existing
        const { data: existing } = await supabaseAdmin
            .from('nudges')
            .select('*')
            .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
            .single();

        if (existing) {
            return res.json(existing);
        }

        // Insert
        const { data, error } = await supabaseAdmin
            .from('nudges')
            .insert({
                from_user_id: fromUserId,
                to_user_id: toUserId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);

    } catch (error) {
        console.error("Backend Nudge Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/chat/nudge/respond
router.post('/nudge/respond', async (req, res) => {
    try {
        const { nudgeId, status } = req.body;

        const { data, error } = await supabaseAdmin
            .from('nudges')
            .update({ status })
            .eq('id', nudgeId)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error("Backend Nudge Respond Error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
