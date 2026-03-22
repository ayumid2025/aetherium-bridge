import cron from 'node-cron';
import { fetchGasPrices } from '../services/gasPriceService';

// Run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  console.log('Fetching gas prices...');
  await fetchGasPrices();
  // Optionally, check if gas prices are low and trigger bulk purchase
});
