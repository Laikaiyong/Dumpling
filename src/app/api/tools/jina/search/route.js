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
        const { q } = body;

        if (!q) {
            return NextResponse.json(
                { error: 'Search query (q) is required' },
                { status: 400 }
            );
        }

        // Make a request to Jina AI Search API
        const response = await fetch('https://s.jina.ai/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-Respond-With': 'no-content'
            },
            body: JSON.stringify({ q }),
        });

        // Check if the response is ok
        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to search: ${errorText}` },
                { status: response.status }
            );
        }

        // Return the search response
        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Error in Jina search API:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
};