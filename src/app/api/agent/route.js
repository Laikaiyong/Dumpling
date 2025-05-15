import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all agents
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const agents = await db.collection('agents').find({}).toArray();
    return NextResponse.json({ agents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new agent
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const { name, description, systemInstructions, type, capabilities = [] } = await request.json();
    
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }
    
    const newAgent = {
      name,
      description,
      systemInstructions,
      type,
      capabilities: capabilities.map(capId => new ObjectId(capId)),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('agents').insertOne(newAgent);
    
    return NextResponse.json({ 
      success: true, 
      agent: { ...newAgent, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}