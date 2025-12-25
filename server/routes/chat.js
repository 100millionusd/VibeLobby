import express from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';

const router = express.Router();

// POST /api/chat/send
// Securely send a message to the lobby
router.post('/send', async (req, res) => {
    try {
        const { hotelId, text, user, isPrivate, image, recipientId } = req.body;



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
                    console.log(`[Push] Attempting to notify user ${recipientId}`);

                    // Get recipient's subscriptions
                    const { data: subs } = await supabaseAdmin
                        .from('push_subscriptions')
                        .select('*')
                        .eq('user_id', recipientId);

                    if (subs && subs.length > 0) {
                        console.log(`[Push] Found ${subs.length} subscriptions for user ${recipientId}`);

                        const payload = JSON.stringify({
                            title: `New Message from ${user.name}`,
                            body: text || 'Sent an image',
                            url: `/?chat=${user.id}`,
                            sound: 'default' // Hint for some processing logic if needed
                        });

                        // Send to all user's devices
                        const importWebPush = await import('web-push'); // Dynamic import to avoid top-level issues if not init
                        const webpush = importWebPush.default;

                        const promises = subs.map(sub => {
                            const pushConfig = {
                                endpoint: sub.endpoint,
                                keys: {
                                    p256dh: sub.p256dh,
                                    auth: sub.auth
                                }
                            };

                            // iOS requires 'urgency: high' for immediate delivery in some cases
                            return webpush.sendNotification(pushConfig, payload, {
                                headers: {
                                    'Urgency': 'high'
                                }
                            })
                                .then(() => console.log(`[Push] Sent successfully to ${sub.id}`))
                                .catch(err => {
                                    console.error(`[Push] Failed for ${sub.id}:`, err.statusCode, err.message);
                                    if (err.statusCode === 410) {
                                        // Subscription expired, delete it
                                        console.log(`[Push] Deleting expired subscription ${sub.id}`);
                                        supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
                                    }
                                });
                        });

                        await Promise.all(promises);
                    } else {
                        console.log(`[Push] No subscriptions found for user ${recipientId}`);
                    }
                } catch (pushErr) {
                    console.error("[Push] Critical Error:", pushErr);
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
        const { subscription, user } = req.body;
        if (!subscription || !user || !user.id) return res.status(400).json({ error: "Missing data" });

        // 1. Ensure User Exists
        await supabaseAdmin.from('users').upsert({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio
        });

        // 2. Add Subscription
        const { error } = await supabaseAdmin
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }, { onConflict: 'user_id, endpoint' });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error("Subscription Error:", err);
        // Return 200 OK even on error to stop frontend retries/noise, but log it
        res.status(200).json({ success: false, error: err.message });
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

// DELETE /api/chat/message/:id
// Delete a specific message
router.delete('/message/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // We need to know who is asking

        if (!userId) return res.status(400).json({ error: "Missing User ID" });

        // 1. Verify ownership (only delete own messages)
        const { data: message, error: fetchError } = await supabaseAdmin
            .from('messages')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.user_id !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // 2. Delete
        const { error: deleteError } = await supabaseAdmin
            .from('messages')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.json({ success: true, id });
    } catch (error) {
        console.error("Backend Delete Message Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/chat/conversation/:partnerId
// Clear entire private conversation
router.delete('/conversation/:partnerId', async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { userId } = req.body;

        if (!userId) return res.status(400).json({ error: "Missing User ID" });

        // Delete messages where (user=me AND recipient=partner) OR (user=partner AND recipient=me)
        // AND is_private = true
        const { error } = await supabaseAdmin
            .from('messages')
            .delete()
            .eq('is_private', true)
            .or(`and(user_id.eq.${userId},recipient_id.eq.${partnerId}),and(user_id.eq.${partnerId},recipient_id.eq.${userId})`);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error("Backend Delete Conversation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/chat/cleanup
// Scheduled job to remove public messages from users who have checked out
router.post('/cleanup', async (req, res) => {
    try {
        console.log("🧹 Starting Chat Cleanup...");
        const now = new Date();

        // 1. Get all users with digital keys
        // We select the raw JSONB column digital_keys
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, digital_keys')
            .not('digital_keys', 'is', null);

        if (error) throw error;
        if (!users) return res.json({ cleaned: 0 });

        let deleteCount = 0;

        // 2. Iterate users and find expired stays
        for (const user of users) {
            const keys = user.digital_keys || [];

            // Collect Hotel IDs where stay is expired
            const expiredHotelIds = keys
                .filter(key => {
                    const checkOutDate = new Date(key.checkOut);
                    return checkOutDate < now;
                })
                .map(key => key.hotelId);

            // Also check City stays (using 'city:CityName' convention)
            const expiredCityChannels = keys
                .filter(key => {
                    const checkOutDate = new Date(key.checkOut);
                    return checkOutDate < now && key.city;
                })
                .map(key => `city:${key.city}`);

            const allExpiredChannels = [...expiredHotelIds, ...expiredCityChannels];

            if (allExpiredChannels.length > 0) {
                // Delete messages from this user in these channels
                const { count } = await supabaseAdmin
                    .from('messages')
                    .delete({ count: 'exact' })
                    .eq('user_id', user.id)
                    .eq('is_private', false)
                    .in('hotel_id', allExpiredChannels);

                if (count) {
                    console.log(`🧹 Cleaned ${count} messages for user ${user.id} in channels ${allExpiredChannels.join(', ')}`);
                    deleteCount += count;
                }
            }
        }

        res.json({ success: true, deletedMessages: deleteCount });

    } catch (err) {
        console.error("Cleanup Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
