import { NextResponse } from 'next/server';

/**
 * GET handler for portfolio requests
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with portfolio data
 */
export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ 
        error: 'Wallet address is required' 
      }, { status: 400 });
    }

    // Get API key from environment variables
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Helius API key is not configured' 
      }, { status: 500 });
    }

    // Set pagination parameters
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Options from query parameters (defaulting to true)
    const showUnverifiedCollections = searchParams.get('showUnverifiedCollections') !== 'false';
    const showCollectionMetadata = searchParams.get('showCollectionMetadata') !== 'false';
    const showFungible = searchParams.get('showFungible') !== 'false';
    const showNativeBalance = searchParams.get('showNativeBalance') !== 'false';

    // Fetch portfolio data from Helius RPC API
    const portfolioData = await fetchHeliusPortfolio(address, apiKey, {
      page,
      limit,
      showUnverifiedCollections,
      showCollectionMetadata,
      showFungible,
      showNativeBalance
    });
    
    // Return the portfolio data
    return NextResponse.json({
      address,
      timestamp: new Date().toISOString(),
      portfolio: portfolioData
    }, { status: 200 });

  } catch (error) {
    console.error('Error in portfolio API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch portfolio data',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * POST handler for portfolio requests with additional options
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with portfolio data
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ 
        error: 'Wallet address is required' 
      }, { status: 400 });
    }

    // Get API key from environment variables
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Helius API key is not configured' 
      }, { status: 500 });
    }

    // Extract options from the request body
    const { 
      page = 1, 
      limit = 50,
      sortBy = {
        sortBy: "created",
        sortDirection: "asc"
      },
      options = {
        showUnverifiedCollections: false,
        showCollectionMetadata: false,
        showGrandTotal: false,
        showFungible: true,
        showNativeBalance: true,
        showInscription: false,
        showZeroBalance: false
      }
    } = body;
    
    // Fetch portfolio data with options
    const portfolioData = await fetchHeliusPortfolio(address, apiKey, { page, limit, sortBy, options });
    
    // Return portfolio data with metadata
    return NextResponse.json({ 
      address,
      timestamp: new Date().toISOString(),
      portfolio: portfolioData
    }, { status: 200 });

  } catch (error) {
    console.error('Error in portfolio API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch portfolio data',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Fetch portfolio data from Helius RPC API
 * @param {string} address - The wallet address
 * @param {string} apiKey - Helius API key
 * @param {Object} config - Configuration options
 * @returns {Object} Formatted portfolio data
 */
async function fetchHeliusPortfolio(address, apiKey, config) {
  const { 
    page = 1, 
    limit = 50,
    sortBy = {
      sortBy: "created",
      sortDirection: "asc"
    },
    options = {
      showUnverifiedCollections: false,
      showCollectionMetadata: false,
      showGrandTotal: false,
      showFungible: true,
      showNativeBalance: true,
      showInscription: false,
      showZeroBalance: false
    }
  } = config;
  
  // Construct the Helius RPC endpoint with API key
  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  
  // Prepare the JSON-RPC request for assets
  const rpcRequest = {
    jsonrpc: "2.0",
    id: "1",
    method: "getAssetsByOwner",
    params: {
      ownerAddress: address,
      page,
      limit,
      sortBy,
      options
    }
  };
  
  // Make the request to Helius API
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rpcRequest)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Helius API Error: ${errorData.error?.message || response.statusText}`);
  }
  
  // Parse the response
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Helius RPC Error: ${data.error.message}`);
  }
  
  // If native balance is requested, fetch it separately
  let solBalance = null;
  if (options.showNativeBalance) {
    solBalance = await fetchSolanaBalance(address, apiKey);
  }
  
  // Format and return the portfolio data
  const result = {
    assets: data.result.items || [],
    totalItems: data.result.total || 0,
    pageCount: data.result.pageCount || 1,
  };
  
  // Add SOL balance if available
  if (solBalance !== null) {
    result.nativeBalance = solBalance;
  }
  
  return result;
}

/**
 * Fetch native SOL balance using Helius RPC
 * @param {string} address - Wallet address
 * @param {string} apiKey - Helius API key
 * @returns {Object} SOL balance information
 */
async function fetchSolanaBalance(address, apiKey) {
  const endpoint = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;
  
  const rpcRequest = {
    jsonrpc: "2.0",
    id: "2",
    method: "getBalance",
    params: [address]
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rpcRequest)
  });
  
  if (!response.ok) {
    console.error('Failed to fetch SOL balance');
    return null;
  }
  
  const data = await response.json();
  
  if (data.error) {
    console.error(`Error fetching SOL balance: ${data.error.message}`);
    return null;
  }
  
  // Convert lamports to SOL
  const lamports = data.result?.value || 0;
  const solAmount = lamports / 1_000_000_000;
  
  return {
    lamports,
    sol: solAmount
  };
}