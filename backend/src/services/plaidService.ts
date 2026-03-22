import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export const createLinkToken = async (userId: string) => {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Aetherium Bridge',
    products: [Products.Auth, Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });
  return response.data.link_token;
};

export const exchangePublicToken = async (publicToken: string) => {
  const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
  return response.data;
};

export const getBankAccountDetails = async (accessToken: string, accountId: string) => {
  const response = await plaidClient.accountsGet({ access_token: accessToken });
  const account = response.data.accounts.find(acc => acc.account_id === accountId);
  return account;
};

export const initiateDeposit = async (accessToken: string, amount: number) => {
  // In sandbox, we can simulate a transfer. Real implementation would use Plaid Transfer or other ACH API.
  // For now, we'll just create a transaction record and return success.
  // This is a placeholder. Real integration would involve initiating a transfer and waiting for webhook.
  return { success: true, transactionId: `sim_${Date.now()}` };
};
