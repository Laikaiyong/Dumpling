import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET: Fetch API keys for a specific agent
 */
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const agentId = params.id;
    const { db } = await connectToDatabase();
    
    // Verify the agent belongs to the wallet address
    const agent = await db.collection('agents').findOne({ 
      _id: new ObjectId(agentId),
      ownerAddress: walletAddress 
    });
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
    }
    
    // Get agent keys (without actual key values)
    const keys = agent.apiKeys || {};
    const keyNames = Object.keys(keys).reduce((acc, key) => {
      acc[key] = '••••••••••••'; // Hide actual key values
      return acc;
    }, {});
    
    return NextResponse.json({ 
      keys: keyNames,
      isOwner: agent.ownerAddress === walletAddress
    });
  } catch (error) {
    console.error('Error fetching agent API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: Add a new API key to an agent
 */
export async function POST(request, { params }) {
  try {
    const body = await request.json();
    const { service, apiKey, keys, walletAddress } = body;
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    const agentId = params.id;
    const { db } = await connectToDatabase();
    
    // Verify the agent belongs to the wallet address
    const agent = await db.collection('agents').findOne({ 
      _id: new ObjectId(agentId),
      ownerAddress: walletAddress 
    });
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
    }
    
    // Update is different depending on whether we're adding a single key or multiple keys
    let updateData = {};
    
    if (keys) {
      // Adding multiple keys at once (store as-is without encryption)
      updateData = { $set: { apiKeys: keys } };
    } else if (service && apiKey) {
      // Adding a single key (store as-is without encryption)
      updateData = { 
        $set: { [`apiKeys.${service}`]: apiKey } 
      };
    } else {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    // Update the agent with the new key(s)
    await db.collection('agents').updateOne(
      { _id: new ObjectId(agentId), ownerAddress: walletAddress },
      updateData
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding agent API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: Remove an API key from an agent
 */
export async function DELETE(request, { params }) {
  try {
    const body = await request.json();
    const { service, walletAddress } = body;
    
    if (!walletAddress || !service) {
      return NextResponse.json({ error: 'Wallet address and service name are required' }, { status: 400 });
    }
    
    const agentId = params.id;
    const { db } = await connectToDatabase();
    
    // Verify the agent belongs to the wallet address
    const agent = await db.collection('agents').findOne({ 
      _id: new ObjectId(agentId),
      ownerAddress: walletAddress 
    });
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
    }
    
    // Remove the specified key
    await db.collection('agents').updateOne(
      { _id: new ObjectId(agentId), ownerAddress: walletAddress },
      { $unset: { [`apiKeys.${service}`]: "" } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing agent API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT: Update API keys for an agent
 */
export async function PUT(request, { params }) {
  try {
    const { keys, walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    const agentId = params.id;
    const { db } = await connectToDatabase();
    
    // Verify the agent belongs to the wallet address
    const agent = await db.collection('agents').findOne({ 
      _id: new ObjectId(agentId),
      ownerAddress: walletAddress 
    });
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or unauthorized' }, { status: 404 });
    }
    
    // Store keys without encryption
    // Update the agent with the new keys
    await db.collection('agents').updateOne(
      { _id: new ObjectId(agentId), ownerAddress: walletAddress },
      { $set: { apiKeys: keys } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating agent API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}