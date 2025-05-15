import { NextResponse } from 'next/server';

/**
 * GET handler for token market data from CoinGecko
 * @param {Request} request - The incoming request object
 * @param {Object} params - URL parameters
 * @returns {NextResponse} JSON response with token data
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get API key from environment variables or query parameter
    const apiKey = process.env.COINGECKO_API_KEY || searchParams.get('apiKey');
    
    // Optional parameters with defaults
    const vs_currency = searchParams.get('currency') || 'usd';
    const order = searchParams.get('order') || 'market_cap_desc';
    const per_page = parseInt(searchParams.get('per_page') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const sparkline = searchParams.get('sparkline') === 'true';
    const include_market_cap = searchParams.get('include_market_cap') !== 'false';
    
    let endpoint;
    let headers = { 'accept': 'application/json' };
    
    // Add API key if available to avoid rate limits
    if (apiKey) {
      headers['x-cg-pro-api-key'] = apiKey;
    }
    
    // Special cases for non-specific token data
    if (id === 'global') {
      endpoint = 'https://api.coingecko.com/api/v3/global';
    } else if (id === 'categories') {
      endpoint = `https://api.coingecko.com/api/v3/coins/categories?order=${order}`;
    } else if (id === 'markets') {
      endpoint = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}`;
    } else {
      // Specific token details
      const includeParams = [];
      if (include_market_cap) includeParams.push('market_data');
      includeParams.push('community_data');
      includeParams.push('developer_data');
      
      const includeParamsString = includeParams.length > 0 
        ? `?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true` 
        : '';
      
      endpoint = `https://api.coingecko.com/api/v3/coins/${id}${includeParamsString}`;
    }
    
    // Make request to CoinGecko API with exponential backoff for retries
    const response = await fetchWithRetry(endpoint, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinGecko API error (${response.status}):`, errorText);
      
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'CoinGecko API rate limit exceeded',
          message: 'Please try again later or use an API key'
        }, { status: 429 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch data from CoinGecko',
        status: response.status,
        message: errorText
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Format response based on the type of data
    let formattedResponse;
    
    if (id === 'global') {
      formattedResponse = {
        market_data: {
          total_market_cap: data.data.total_market_cap.usd,
          total_volume: data.data.total_volume.usd,
          market_cap_percentage: data.data.market_cap_percentage,
          market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd
        },
        active_cryptocurrencies: data.data.active_cryptocurrencies,
        markets: data.data.markets,
        updated_at: new Date(data.data.updated_at * 1000).toISOString()
      };
    } else if (id === 'categories') {
      formattedResponse = data.map(category => ({
        id: category.id,
        name: category.name,
        market_cap: category.market_cap,
        market_cap_change_24h: category.market_cap_change_24h,
        volume_24h: category.volume_24h,
        content: category.content,
        top_3_coins: category.top_3_coins,
        updated_at: category.updated_at
      }));
    } else if (id === 'markets') {
      formattedResponse = data.map(token => ({
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        image: token.image,
        current_price: token.current_price,
        market_cap: token.market_cap,
        market_cap_rank: token.market_cap_rank,
        total_volume: token.total_volume,
        price_change_24h: token.price_change_24h,
        price_change_percentage_24h: token.price_change_percentage_24h,
        market_cap_change_percentage_24h: token.market_cap_change_percentage_24h,
        circulating_supply: token.circulating_supply,
        total_supply: token.total_supply,
        max_supply: token.max_supply,
        last_updated: token.last_updated
      }));
    } else {
      // Specific token details with selected fields
      formattedResponse = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        description: data.description?.en || "",
        image: {
          thumb: data.image?.thumb,
          small: data.image?.small,
          large: data.image?.large
        },
        links: {
          homepage: data.links?.homepage,
          blockchain_site: data.links?.blockchain_site,
          official_forum_url: data.links?.official_forum_url,
          chat_url: data.links?.chat_url,
          announcement_url: data.links?.announcement_url,
          twitter_screen_name: data.links?.twitter_screen_name,
          telegram_channel_identifier: data.links?.telegram_channel_identifier,
          subreddit_url: data.links?.subreddit_url,
          repos_url: data.links?.repos_url
        },
        market_data: data.market_data ? {
          current_price: data.market_data.current_price,
          market_cap: data.market_data.market_cap,
          total_volume: data.market_data.total_volume,
          high_24h: data.market_data.high_24h,
          low_24h: data.market_data.low_24h,
          price_change_24h: data.market_data.price_change_24h,
          price_change_percentage_24h: data.market_data.price_change_percentage_24h,
          market_cap_change_24h: data.market_data.market_cap_change_24h,
          market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
          circulating_supply: data.market_data.circulating_supply,
          total_supply: data.market_data.total_supply,
          max_supply: data.market_data.max_supply,
          ath: data.market_data.ath,
          ath_change_percentage: data.market_data.ath_change_percentage,
          ath_date: data.market_data.ath_date,
          atl: data.market_data.atl,
          atl_change_percentage: data.market_data.atl_change_percentage,
          atl_date: data.market_data.atl_date
        } : null,
        community_data: data.community_data,
        developer_data: data.developer_data,
        last_updated: data.last_updated
      };
    }
    
    // Add caching headers to reduce API calls
    const headers_response = {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    };
    
    return NextResponse.json({ 
      data: formattedResponse,
      source: "CoinGecko",
      timestamp: new Date().toISOString()
    }, { status: 200, headers: headers_response });
    
  } catch (error) {
    console.error('Error fetching token data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch token data',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Helper function to fetch with retry logic for rate limiting
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries left
 * @param {number} backoff - Backoff time in ms
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  try {
    const response = await fetch(url, options);
    
    // If rate limited and we have retries left, wait and try again
    if (response.status === 429 && retries > 0) {
      // Get retry-after header or use backoff
      const retryAfter = response.headers.get('retry-after');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : backoff;
      
      console.log(`Rate limited, retrying after ${waitTime}ms. Retries left: ${retries}`);
      
      // Wait for the backoff period
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Retry with exponential backoff
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Fetch error, retrying. Retries left: ${retries}`);
      
      // Wait for the backoff period
      await new Promise(resolve => setTimeout(resolve, backoff));
      
      // Retry with exponential backoff
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    throw error;
  }
}