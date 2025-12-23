import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Duffel } from '@duffel/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const duffel = new Duffel({
    token: process.env.DUFFEL_ACCESS_TOKEN,
});

async function run() {
    console.log("Debug Script Started");
    console.log("Token Present:", !!process.env.DUFFEL_ACCESS_TOKEN);

    // Dates: Tomorrow + 2 days
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 3);

    const checkIn = tomorrow.toISOString().split('T')[0];
    const checkOut = dayAfter.toISOString().split('T')[0];

    console.log(`Searching Barcelona for ${checkIn} to ${checkOut}...`);

    try {
        const search = await duffel.stays.search({
            location: {
                radius: 10,
                geographic_coordinates: { latitude: 41.3851, longitude: 2.1734 }
            },
            check_in_date: checkIn,
            check_out_date: checkOut,
            rooms: 1,
            guests: [{ type: 'adult' }]
        });

        console.log(`Search Results Count: ${search.data.results.length}`);

        if (search.data.results.length > 0) {
            // Check top 1 result
            const top3 = search.data.results.slice(0, 1);

            for (let i = 0; i < top3.length; i++) {
                const res = top3[i];
                console.log(`\n--- Result ${i + 1}: ${res.accommodation.name} (${res.id}) ---`);
                console.log("Search Result 'rooms' count:", res.rooms ? res.rooms.length : "undefined");

                try {
                    const rates = await duffel.stays.searchResults.fetchAllRates(res.id);
                    console.log("\n*** RATE RESPONSE ***");
                    console.log("Keys:", Object.keys(rates.data));
                    console.log("Full Dump:", JSON.stringify(rates.data, null, 2));
                } catch (rateErr) {
                    console.error("FetchRates Error:", rateErr.message);
                }
            }
        }
    } catch (e) {
        console.error("Search Error:", e);
    }
}

run();
