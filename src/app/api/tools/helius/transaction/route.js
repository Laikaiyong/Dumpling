import { NextResponse } from 'next/server';

// src/app/api/tools/helius/transaction/route.js

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_API_URL = 'https://api.helius.xyz/v0';

export async function GET(request) {
    try {
        // Extract the wallet address from the query parameters
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('address');

        // Validate the wallet address
        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Make the request to Helius API
        const response = await fetch(
            `${HELIUS_API_URL}/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}`,
            { method: 'GET' }
        );

        // Handle API errors
        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: 'Failed to fetch transactions', details: errorData },
                { status: response.status }
            );
        }

        // Return the transaction data
        const transactions = await response.json();
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}