import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';
import { generateEmbedding } from '@/utils/embeddings';

// GET - Fetch a specific capability
export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid capability ID' }, { status: 400 });
    }
    
    const capability = await db.collection('capabilities').findOne({ _id: new ObjectId(id) });
    
    if (!capability) {
      return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
    }
    
    return NextResponse.json({ capability }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a capability
export async function PUT(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const { name, description, type, parameters, apiEndpoint } = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid capability ID' }, { status: 400 });
    }
    
    // Generate new embedding if description changed
    let updates = {
      ...(name && { name }),
      ...(type && { type }),
      ...(parameters && { parameters }),
      ...(apiEndpoint !== undefined && { apiEndpoint }),
      updatedAt: new Date()
    };
    
    if (description) {
      // Generate embedding for updated description
      const descriptionVector = await generateEmbedding(description);
      updates = {
        ...updates,
        description,
        descriptionVector
      };
    }
    
    const result = await db.collection('capabilities').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      updated: result.modifiedCount
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a capability
export async function DELETE(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid capability ID' }, { status: 400 });
    }
    
    // First check if this capability is used by any agents
    const agentsUsingCapability = await db.collection('agents').findOne({ 
      capabilities: new ObjectId(id)
    });
    
    if (agentsUsingCapability) {
      return NextResponse.json({ 
        error: 'Cannot delete: This capability is being used by one or more agents' 
      }, { status: 400 });
    }
    
    const result = await db.collection('capabilities').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Capability not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}