import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Duffel Webhook Handler
router.post('/duffel', async (req, res) => {
    try {
        const signature = req.headers['x-duffel-signature'];
        const secret = process.env.DUFFEL_WEBHOOK_SECRET;

        // 1. Verify Signature (if secret is configured)
        if (secret) {
            if (!req.rawBody) {
                console.error("Webhook Error: req.rawBody is missing. Middleware configuration issue.");
                return res.status(500).send("Internal Server Error: Raw body missing");
            }

            const hmac = crypto.createHmac('sha256', secret);
            const digest = hmac.update(req.rawBody).digest('hex');

            console.log(`[Webhook Debug] Secret Configured: ${secret ? 'Yes (Starts with ' + secret.substring(0, 4) + '...)' : 'NO'}`);
            console.log(`[Webhook Debug] Received Signature: ${signature}`);
            console.log(`[Webhook Debug] Computed Digest:    ${digest}`);
            console.log(`[Webhook Debug] Raw Body Length:    ${req.rawBody.length}`);

            if (signature !== digest) {
                console.warn("Webhook Signature Mismatch!");
                return res.status(401).send("Invalid Signature");
            }
        } else {
            console.warn("WARNING: DUFFEL_WEBHOOK_SECRET not set. Skipping signature verification.");
        }

        // 2. Process Event
        const event = req.body;
        const eventType = event.type;
        const eventData = event.data;

        console.log(`Received Duffel Webhook: ${eventType}`, eventData?.id);

        if (eventType === 'booking.cancelled') {
            console.log("💰 Booking Cancelled via Webhook - Triggering Refund/Update Logic...");
            // TODO: Update Supabase status to 'cancelled'
            // TODO: Trigger Refund email
        } else if (eventType === 'order.created') {
            console.log("✅ Order Created via Webhook");
        }

        // 3. Acknowledge Receipt
        res.status(200).send({ received: true });

    } catch (err) {
        console.error("Webhook Processing Error:", err);
        res.status(500).send("Webhook process failed");
    }
});

export default router;
