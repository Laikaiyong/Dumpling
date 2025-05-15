import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import axios from 'axios';
import { generateEmbedding } from '@/utils/embeddings';

/**
 * Performs vector similarity search on tokens in MongoDB Atlas
 * @param {Object} db - MongoDB database connection
 * @param {Array} queryEmbedding - The query embedding vector
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of matching tokens
 */
async function vectorSearch(db, queryEmbedding, limit = 5) {
  const collection = db.collection('token');
  
  // Perform the vector search using MongoDB's $vectorSearch
  const results = await collection.aggregate([
    {
      $vectorSearch: {
        index: 'token_vector',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 4000,
        limit: limit
      }
    }
  ]).toArray();

  console.log(results);
  
  return results;
}

/**
 * GET handler for token search API
 */
export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const url = new URL(req.url);
    
    // Get search parameters
    const query = url.searchParams.get('query') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sort = url.searchParams.get('sort') || 'name';
    const order = url.searchParams.get('order') === 'desc' ? -1 : 1;
    
    // Vector search parameter - either provided directly or generated from text query
    const vectorParam = url.searchParams.get('vector');
    let queryVector = null;
    
    if (vectorParam) {
      try {
        queryVector = JSON.parse(vectorParam);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid vector format' }, { status: 400 });
      }
    } else if (query) {
      // Generate embedding from query text using Jina
      try {
        queryVector = await generateEmbedding(query);
      } catch (e) {
        console.error('Failed to generate embedding for query:', e);
        // Continue with text search if embedding generation fails
      }
    }

    console.log(queryVector);
    
    let tokens = [];
    let totalCount = 0;
    
    // Pagination calculations
    const skip = (page - 1) * limit;
    
    if (queryVector) {
      // Perform vector search if a query vector is provided
      tokens = await vectorSearch(db, queryVector, limit);
      totalCount = tokens.length; // For vector search, we only have the returned results
    } else if (query) {
      // Text search if no vector but text query exists
      const textSearchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { symbol: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      };
      
      tokens = await db.collection('tokens').find(textSearchQuery)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .toArray();
        
      totalCount = await db.collection('tokens').countDocuments(textSearchQuery);
    } else {
      // No search query, just return paginated tokens
      const sortOptions = {};
      sortOptions[sort] = order;
      
      tokens = await db.collection('tokens').find({})
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .toArray();
        
      totalCount = await db.collection('tokens').countDocuments();
    }
    
    return NextResponse.json({
      tokens,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      },
      vectorSearchEnabled: Boolean(queryVector) || tokens.some(t => t.hasOwnProperty('embedding'))
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in token search API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tokens',
      message: error.message
    }, { status: 500 });
  }
}