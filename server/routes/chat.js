import express from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';

const router = express.Router();

// POST /api/chat/send
// Securely send a message to the lobby
router.post('/send', async (req, res) => {
    try {
        const { hotelId, text, user, isPrivate, image, recipientId } = req.body;

        console.log("Received /send request:", { hotelId, hasText: !!text, hasImage: !!image, userId: user?.id, isPrivate, recipientId });

        if (!hotelId || (!text && !image) || !user || !user.id) {
            console.error("Missing required fields:", { hotelId, text, image, user });
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (isPrivate && !recipientId) {
            return res.status(400).json({ error: "Missing recipient for private message" });
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
                recipient_id: isPrivate ? recipientId : null
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // 3. Send Push Notification (Fire and Forget)
        if (isPrivate && recipientId) {
            (async () => {
                try {
                    // Get recipient's subscriptions
                    const { data: subs } = await supabaseAdmin
                        .from('push_subscriptions')
                        .select('*')
                        .eq('user_id', recipientId);

                    if (subs && subs.length > 0) {
                        const payload = JSON.stringify({
                            title: `New Message from ${user.name}`,
                            body: text || 'Sent an image',
                            url: `/?chat=${user.id}` // Deep link logic (simplified)
                        });

                        // Send to all user's devices
                        const importWebPush = await import('web-push'); // Dynamic import to avoid top-level issues if not init
                        const webpush = importWebPush.default;

                        subs.forEach(sub => {
                            const pushConfig = {
                                endpoint: sub.endpoint,
                                keys: {
                                    p256dh: sub.p256dh,
                                    auth: sub.auth
                                }
                            };
                            webpush.sendNotification(pushConfig, payload).catch(err => {
                                console.error("Push Failed", err);
                                if (err.statusCode === 410) {
                                    // Subscription expired, delete it
                                    supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
                                }
                            });
                        });
                    }
                } catch (pushErr) {
                    console.error("Push Notification Error:", pushErr);
                }
            })();
        }

        res.json(data);

    } catch (error) {
        console.error("Backend Chat Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/chat/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { subscription, userId } = req.body;
        if (!subscription || !userId) return res.status(400).json({ error: "Missing data" });

        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }, { onConflict: 'user_id, endpoint' });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error("Subscription Error:", err);
        res.status(500).json({ error: err.message });
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
