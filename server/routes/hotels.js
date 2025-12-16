const express = require('express');
const { Duffel } = require('@duffel/api');
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
        const { quoteId, guests, email, phoneNumber } = req.body;

        const booking = await duffel.stays.bookings.create({
            quote_id: quoteId,
            guests: guests, // [{ given_name, family_name, born_on, ... }]
            email: email,
            phone_number: phoneNumber
        });

        res.json(booking.data);
    } catch (error) {
        console.error('Duffel Booking Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
