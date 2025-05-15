import { NextResponse } from 'next/server';

/**
 * GET handler for web search requests using Serper API
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with search results
 */
export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || searchParams.get('q');

    if (!query) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 });
    }

    // Perform web search using Serper API
    const results = await performSerperSearch(query);
    
    // Return search results
    return NextResponse.json({ 
      results 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ 
      error: 'Failed to perform search',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * POST handler for web search requests with more options
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with search results
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Handle both q and query parameters (client is using q)
    const query = body.query || body.q;

    if (!query) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 });
    }

    // Additional optional parameters
    const { gl = 'us', hl = 'en', num = 10, type = 'search' } = body;

    // Perform search using Serper API
    const results = await performSerperSearch(query, { gl, hl, num, type });
    
    // Return search results with same format as scraper for consistency
    return NextResponse.json({ 
      query,
      type,
      timestamp: new Date().toISOString(),
      results: results.organic || []
    }, { status: 200 });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ 
      error: 'Failed to perform search',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Perform search using the Serper API
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @returns {Object} Formatted search results
 */
async function performSerperSearch(query, options = {}) {
  const { gl = 'us', hl = 'en', num = 10, type = 'search' } = options;
  
  // Get API key from environment variable
  const serperApiKey = process.env.SERPER_API_KEY;
  
  if (!serperApiKey) {
    throw new Error('SERPER_API_KEY environment variable is not set');
  }
  
  // Map the search type to Serper's expected format
  let searchType = 'search';
  if (type === 'images') searchType = 'images';
  if (type === 'news') searchType = 'news';
  
  // Prepare the request to Serper API
  const url = 'https://google.serper.dev/search';
  
  const payload = {
    q: query,
    gl,
    hl,
    num: Math.min(num, 20), // Serper may have limits, ensure we don't exceed
    type: searchType
  };
  
  // Make the request to Serper API
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': serperApiKey
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Serper API error (${response.status}): ${errorText}`);
  }
  
  // Parse the response
  const data = await response.json();
  
  // Format results to match expected structure in client code
  return {
    searchParameters: {
      q: query,
      gl,
      hl,
    },
    organic: Array.isArray(data.organic) 
      ? data.organic.slice(0, num) 
      : [],
    knowledge: data.knowledgeGraph,
    related: data.relatedSearches,
    places: data.places,
    images: data.images,
    news: data.news,
    pagination: {
      current: 1,
      next: '/search?q=' + encodeURIComponent(query) + '&page=2'
    }
  };
}