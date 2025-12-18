import express from 'express';
import { Duffel } from '@duffel/api';
const router = express.Router();

const duffel = new Duffel({
    token: process.env.DUFFEL_ACCESS_TOKEN,
});

// 1. Search for Accommodation
router.post('/search', async (req, res) => {
    try {
        const { location, checkInDate, checkOutDate, guests, rooms } = req.body;

        // Basic validation
        if (!location || !checkInDate || !checkOutDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const search = await duffel.stays.search({
            rooms: rooms || 1,
            location: location, // { radius: 5, geographic_coordinates: { lat, lng } }
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            guests: guests || [{ type: 'adult' }]
        });

        res.json(search.data);
    } catch (error) {
        console.error('Duffel Search Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Fetch All Rates for a Result
router.get('/:id/rates', async (req, res) => {
    try {
        const { id } = req.params;
        const rates = await duffel.stays.searchResults.fetchAllRates(id);
        res.json(rates.data);
    } catch (error) {
        console.error('Duffel Rates Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Create a Quote (Lock in Price)
// 3. Create a Quote (Lock in Price)
router.post('/quote', async (req, res) => {
    try {
        const { rateId } = req.body;

        // Mock Fallback
        if (rateId && rateId.startsWith('offer_')) {
            console.log("Using Mock Quote for:", rateId);
            return res.json({
                id: `quote_mock_${Date.now()}`,
                total_amount: "250.00",
                total_currency: "USD",
                tax_amount: "25.00",
                base_amount: "225.00"
            });
        }

        const quote = await duffel.stays.quotes.create(rateId);
        res.json(quote.data);
    } catch (error) {
        console.error('Duffel Quote Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Create a Booking
router.post('/book', async (req, res) => {
    try {
        const { quoteId, guests, email, phoneNumber, paymentToken } = req.body;

        // Mock Fallback
        if (quoteId && quoteId.startsWith('quote_mock_')) {
            console.log("Using Mock Booking for:", quoteId);
            return res.json({
                id: `booking_mock_${Date.now()}`,
                reference: `REF${Math.floor(Math.random() * 10000)}`,
                status: "confirmed",
                guests: guests,
                email: email
            });
        }

        const bookingPayload = {
            quote_id: quoteId,
            guests: guests, // [{ given_name, family_name, born_on, ... }]
            email: email,
            phone_number: phoneNumber
        };

        if (paymentToken) {
            bookingPayload.payment = {
                type: "card",
                token: paymentToken
            };
        }

        const booking = await duffel.stays.bookings.create(bookingPayload);

        res.json(booking.data);
    } catch (error) {
        console.error('Duffel Booking Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
