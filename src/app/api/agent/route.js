import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all agents
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    
    // If wallet address is provided, filter agents by ownership
    let query = {};
    if (walletAddress) {
      query = { 
        $or: [
          { ownerAddress: walletAddress },
          { ownerAddress: { $exists: false } } // Public bots (no owner)
        ]
      };
    }
    
    const agents = await db.collection('agents').find(query).toArray();
    
    // Add isPublic and isOwner flags to each agent
    const enhancedAgents = agents.map(agent => ({
      ...agent,
      isPublic: !agent.ownerAddress,
      isOwner: agent.ownerAddress === walletAddress
    }));
    
    return NextResponse.json({ agents: enhancedAgents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new agent with wallet ownership
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const { 
      name, 
      description, 
      systemInstructions, 
      type, 
      capabilities = [], 
      walletAddress
    } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }
    console.log(capabilities)
    
    const newAgent = {
      name,
      description,
      systemInstructions,
      type,
      capabilities: capabilities.map(capId => {
        // Check if the capability ID is valid for ObjectId
        if (ObjectId.isValid(capId)) {
          return new ObjectId(capId);
        } else {
          throw new Error(`Invalid capability ID: ${capId}`);
        }
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Only add owner address if not public and wallet address provided
    if (walletAddress) {
      newAgent.ownerAddress = walletAddress;
    }
    
    const result = await db.collection('agents').insertOne(newAgent);
    
    return NextResponse.json({ 
      success: true, 
      agent: { 
        ...newAgent, 
        _id: result.insertedId,
        isPublic: !newAgent.ownerAddress,
        isOwner: !!walletAddress && newAgent.ownerAddress === walletAddress
      }
    }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}