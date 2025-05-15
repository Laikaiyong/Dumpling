import { NextResponse } from 'next/server';

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
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Make a request to Jina AI API
        const response = await fetch('https://r.jina.ai/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        // Check if the response is ok
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to get embedding: ${errorText}` },
                { status: response.status }
            );
        }

        // Return the embedding response
        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Error in Jina embedding API:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
};