import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch single agent
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const agent = await db.collection('agents').findOne({ _id: new ObjectId(id) });
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    // Fetch related capabilities
    const capabilities = await db.collection('capabilities')
      .find({ _id: { $in: agent.capabilities || [] } })
      .toArray();

    // Get flow data
    const flow = await db.collection('flows').findOne({ agentId: new ObjectId(id) });
    
    // Get knowledge documents count
    const knowledgeCount = await db.collection('knowledge').countDocuments({ agentId: new ObjectId(id) });
    
    return NextResponse.json({ 
      agent,
      capabilities,
      flow,
      knowledgeCount
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update agent
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const { name, description, systemInstructions, type, capabilities = [] } = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }
    
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(systemInstructions && { systemInstructions }),
      ...(type && { type }),
      capabilities: capabilities.map(capId => new ObjectId(capId)),
      updatedAt: new Date()
    };
    
    const result = await db.collection('agents').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, updated: result.modifiedCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove an agent
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }
    
    // First delete related data
    await db.collection('flows').deleteMany({ agentId: new ObjectId(id) });
    await db.collection('knowledge').deleteMany({ agentId: new ObjectId(id) });
    
    // Then delete the agent
    const result = await db.collection('agents').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}