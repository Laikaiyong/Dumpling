import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';
import { generateEmbedding } from '../../../utils/embeddings';

// GET - Fetch all capabilities or search by vector similarity
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    // If search parameter is provided, perform vector search
    if (search) {
      // Generate embedding vector for search query
      const searchVector = await generateEmbedding(search);
      
      try {
        // Try MongoDB Atlas vector search if available
        const capabilities = await db.collection('capabilities')
          .aggregate([
            {
              $search: {
                "vectorSearch": {
                  "queryVector": searchVector,
                  "path": "descriptionVector",
                  "numCandidates": 100,
                  "limit": 10
                },
                "returnStoredSource": true
              }
            },
            {
              $project: {
                _id: 1,
                name: 1,
                description: 1,
                type: 1,
                parameters: 1,
                apiEndpoint: 1,
                createdAt: 1,
                updatedAt: 1,
                score: { $meta: "searchScore" }
              }
            }
          ]).toArray();
        
        return NextResponse.json({ capabilities }, { status: 200 });
      } catch (error) {
        console.warn('MongoDB Atlas vector search failed, falling back to manual vector search:', error);
        // Fallback to manual vector search if MongoDB Atlas vector search is not available
        const capabilities = await manualVectorSearch(db, 'capabilities', searchVector);
        return NextResponse.json({ capabilities }, { status: 200 });
      }
    }
    
    // Otherwise, return all capabilities
    const capabilities = await db.collection('capabilities').find({}).toArray();
    return NextResponse.json({ capabilities }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/capability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new capability with vector embedding
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const { name, description, type, parameters, apiEndpoint } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Check if capability already exists
    const existingCapability = await db.collection('capabilities').findOne({ name });
    
    if (existingCapability) {
      return NextResponse.json({ 
        capability: existingCapability,
        message: 'Capability already exists' 
      }, { status: 200 });
    }
    
    // Generate embedding for the description using HuggingFaceJS with rubert-tiny2
    const descriptionText = description || `${name} capability`;
    const descriptionVector = await generateEmbedding(descriptionText);
    
    const newCapability = {
      name,
      description: descriptionText,
      type: type || 'standard',
      parameters: parameters || [],
      apiEndpoint: apiEndpoint || null,
      descriptionVector, // Store the vector embedding
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('capabilities').insertOne(newCapability);
    
    return NextResponse.json({ 
      success: true, 
      capability: { ...newCapability, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating capability:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}