export const coinPaymentsUtils = {
    // API base URL - Update this to your deployed API URL if needed, or use relative /api
    baseUrl: 'https://conp.xcoder.site',

    async createTransaction(params: {
        amount: number;
        currency1: string;
        currency2: string;
        buyer_email: string;
        item_name: string;
        custom: string;
    }) {
        try {
            console.log('Making request to:', `${this.baseUrl}/api/coinpayments/create-transaction`);
            console.log('Request params:', params);

            const response = await fetch(`${this.baseUrl}/api/coinpayments/create-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                mode: 'cors', // Explicitly set CORS mode
                body: JSON.stringify(params),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            return data;
        } catch (error) {
            console.error('Error creating CoinPayments transaction:', error);

            // More specific error messages
            if (error instanceof TypeError && (error as Error).message.includes('fetch')) {
                throw new Error('Network error: Could not connect to payment service. Please check your internet connection.');
            } else if (error instanceof SyntaxError) {
                throw new Error('Invalid response from payment service. Please try again.');
            } else {
                throw error;
            }
        }
    },

    async getTransactionInfo(txnId: string) {
        try {
            console.log('Getting transaction info for:', txnId);

            const response = await fetch(`${this.baseUrl}/api/coinpayments/get-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                mode: 'cors',
                body: JSON.stringify({ txn_id: txnId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting CoinPayments transaction info:', error);
            throw error;
        }
    },

    async getRates() {
        try {
            const response = await fetch(`${this.baseUrl}/api/coinpayments/rates`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                mode: 'cors',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting CoinPayments rates:', error);
            throw error;
        }
    }
};
