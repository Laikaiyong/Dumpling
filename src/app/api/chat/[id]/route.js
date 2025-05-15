import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

/**
 * POST: Public API endpoint for interacting with a bot
 * Authentication is done via API key
 */
export async function POST(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const agentId = params.id;
    
    // Get the request body
    const body = await request.json();
    const { message, apiKey } = body;
    
    // Validate required parameters
    if (!message || !apiKey) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Find the agent
    const agent = await db.collection('agents').findOne({ _id: new ObjectId(agentId) });
    
    if (!agent) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }
    
    // Validate API key - simple string comparison since we're not using encryption
    const agentKeys = agent.apiKeys || {};
    const apiKeyValid = Object.values(agentKeys).some(storedKey => storedKey === apiKey);
    
    if (!apiKeyValid) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    // Identify agent capabilities
    const capabilities = await db.collection('capabilities').find({
      _id: { $in: agent.capabilities || [] }
    }).toArray();
    
    const hasFinanceCapability = capabilities.some(
      c => c.name === "Price Tracking" || c.name === "Market Analysis"
    );

    const hasBlockchainCapability = capabilities.some(
      c => c.name === "Transaction Analysis" || c.name === "Wallet Insights"
    );

    const hasSearchCapability = capabilities.some(
      c => c.name === "Web Search" || c.name === "Knowledge Retrieval"
    );

    // Build system instruction with available tools information
    let enhancedSystemInstructions = agent.systemInstructions || "";

    if (hasFinanceCapability) {
      enhancedSystemInstructions += "\n\nYou have access to cryptocurrency market data. You can check prices, market caps, and trends.";
    }

    if (hasBlockchainCapability) {
      enhancedSystemInstructions += "\n\nYou can analyze blockchain transactions and wallet data on Solana when provided with a wallet address.";
    }

    if (hasSearchCapability) {
      enhancedSystemInstructions += "\n\nYou can search the web for information when answering questions.";
    }
    
    // Get AI response (mocked for now - integrate with your actual AI service)
    const aiResponse = {
      completion: "This is a sample response from the bot API. In a real implementation, this would be the response from your AI service based on the user's message.",
      thought: "Sample thought process"
    };
    
    // Prepare response
    const response = {
      botName: agent.name,
      message: aiResponse.completion,
      timestamp: new Date(),
      metadata: {
        // Add any relevant metadata
      }
    };
    
    // Log usage for metrics
    await db.collection('apiUsage').insertOne({
      agentId,
      timestamp: new Date(),
      type: 'api',
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing bot API request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}