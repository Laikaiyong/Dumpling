import { NextResponse } from 'next/server';
import axios from 'axios';

export const POST = async (req) => {
    try {
        // Get the API key from environment variables
        const apiKey = process.env.JINA_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json(
                { error: 'JINA_API_KEY is not configured' },
                { status: 500 }
            );
        }

        // Parse the request body
        const body = await req.json();
        const { input, dimensions } = body;

        if (!input || !Array.isArray(input) || input.length === 0) {
            return NextResponse.json(
                { error: 'Valid input array is required' },
                { status: 400 }
            );
        }

        // Prepare request data for Jina AI API with the new model
        const requestData = {
            model: 'jina-embeddings-v3',
            dimensions: 384, // Default to 384 if not specified
            input: input
        };

        // Make a request to Jina AI API
        const response = await axios.post('https://api.jina.ai/v1/embeddings', requestData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        // Return the embedding response
        return NextResponse.json(response.data);
        
    } catch (error) {
        console.error('Error in Jina embedding API:', error);
        
        // Handle axios specific errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return NextResponse.json(
                { error: error.response.data || 'Server responded with an error' },
                { status: error.response.status }
            );
        } else {
            return NextResponse.json(
                { error: error.message || 'An error occurred while processing your request' },
                { status: 500 }
            );
        }
    }
};