const axios = require('axios');
const cheerio = require('cheerio');
const RawUpdate = require('../models/RawUpdate');

// Mock list of official sources
const SOURCES = [
    { url: 'https://krishi.maharashtra.gov.in/notifications', name: 'MahaAgri Notifications' },
    { url: 'https://agricoop.nic.in/en/whats-new', name: 'Central Agri Co-op' }
];

const fetchUpdates = async () => {
    console.log('Starting fetchUpdates job...');
    let count = 0;

    for (const source of SOURCES) {
        try {
            // In a real app, we would fetch(source.url)
            // const { data } = await axios.get(source.url);
            // const $ = cheerio.load(data);

            // MOCK LOGIC for demo stability
            const mockTitle = `New Scheme Update from ${source.name} - ${new Date().toLocaleDateString()}`;
            const mockUrl = `${source.url}/doc-${Date.now()}`; // Unique URL simulation

            // Check if exists
            const exists = await RawUpdate.findOne({ url: mockUrl });
            if (!exists) {
                await RawUpdate.create({
                    source: source.name,
                    originalTitle: mockTitle,
                    originalContent: "This is a raw fetched content requiring admin verification.",
                    url: mockUrl,
                    status: 'PENDING'
                });
                count++;
            }

        } catch (err) {
            console.error(`Failed to fetch from ${source.name}:`, err.message);
        }
    }

    console.log(`Job finished. Fetched ${count} new updates.`);
    return count;
};

module.exports = fetchUpdates;
