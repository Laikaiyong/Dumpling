import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';

/**
 * GET - Fetch all available capabilities
 * This endpoint returns a list of all capabilities that can be assigned to agents
 */
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Get all capabilities from the database
    const capabilities = await db.collection('capabilities')
      .find({})
      .project({ 
        _id: 1,
        name: 1, 
        description: 1, 
      })
      .toArray();
  
    
    return NextResponse.json({ 
      capabilities: capabilities,
      success: true 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching capabilities:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch capabilities', 
      success: false 
    }, { status: 500 });
  }
}