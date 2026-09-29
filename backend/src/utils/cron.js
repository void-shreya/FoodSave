const cron = require('node-cron');
const db = require('../models/db');

const initCronJobs = () => {
  // Check for expired donations every minute: '* * * * *'
  cron.schedule('* * * * *', () => {
    try {
      const expiredCount = db.autoExpireDonations();
      if (expiredCount > 0) {
        console.log(`⏰ Expiry Job: Marked ${expiredCount} donations as EXPIRED.`);
      }
    } catch (err) {
      console.error('Error running expiration cron:', err);
    }
  });

  console.log('⏰ Expiration background cron job scheduled (every minute).');
};

module.exports = {
  initCronJobs
};
