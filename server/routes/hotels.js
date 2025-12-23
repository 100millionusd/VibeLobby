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
        console.log(`[Backend] Fetching rates for ID: ${id}`);
        const rates = await duffel.stays.searchResults.fetchAllRates(id);

        const roomsCount = rates.data.rooms ? rates.data.rooms.length : 0;
        console.log(`[Backend] Rates response for ${id}: ${roomsCount} rooms found.`);
        if (roomsCount === 0) {
            console.log(`[Backend] Empty rooms payload keys: ${Object.keys(rates.data)}`);
        }

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

        const bookingPayload = {
            quote_id: quoteId,
            guests: guests, // [{ given_name, family_name, born_on, ... }]
            email: email,
            phone_number: phoneNumber
        };

        // Use Duffel Balance for instant 3DS-free payment in Test Mode
        // This simulates the Agency paying Duffel.
        bookingPayload.payment = {
            type: "balance"
        };

        const booking = await duffel.stays.bookings.create(bookingPayload);

        res.json(booking.data);
    } catch (error) {
        console.error('Duffel Booking Error (Full):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        if (error.errors) {
            console.error('Duffel API Errors:', JSON.stringify(error.errors, null, 2));
        }
        // Send detailed error to client for debugging
        res.status(500).json({
            error: error.message,
            details: error.errors || error.meta || 'No additional details'
        });
    }
});

export default router;
