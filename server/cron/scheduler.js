const cron = require('node-cron');
const fetchUpdates = require('../utils/fetchUpdates');

const initCron = () => {
    // Run every day at midnight: '0 0 * * *'
    // For demo: Run every 5 minutes '*/5 * * * *'
    cron.schedule('0 0 * * *', () => {
        fetchUpdates();
    });
    console.log('Cron jobs scheduled (Daily at Midnight).');
};

module.exports = initCron;
