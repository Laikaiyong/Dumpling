import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { generateEmbedding } from '@/utils/embeddings';

/**
 * POST handler for knowledge base vector search
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with search results
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { query, limit = 3 } = body;

    if (!query) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Generate embedding for search query
    let searchVector;
    try {
      searchVector = await generateEmbedding(query);
    } catch (error) {
      console.error('Error generating embedding:', error);
      // If vector search fails, fall back to text search
      return performTextSearch(db, query, limit);
    }

    // Try vector search
    try {
      // Perform MongoDB Atlas vector search if available
      const results = await db.collection('knowledge')
        .aggregate([
          {
            $search: {
              "vectorSearch": {
                "queryVector": searchVector,
                "path": "embedding",
                "numCandidates": 100,
                "limit": limit
              }
            }
          },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              category: 1,
              url: 1,
              tags: 1,
              score: { $meta: "searchScore" }
            }
          }
        ]).toArray();
        
      return NextResponse.json({
        results,
        count: results.length,
        searchType: 'vector'
      }, { status: 200 });
      
    } catch (error) {
      console.error('Vector search failed, falling back to text search:', error);
      return performTextSearch(db, query, limit);
    }
  } catch (error) {
    console.error('Error in knowledge search API:', error);
    return NextResponse.json({ 
      error: 'Failed to search knowledge base',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Fallback text search when vector search is unavailable
 * @param {Object} db - MongoDB database instance
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {NextResponse} JSON response with search results
 */
async function performTextSearch(db, query, limit) {
  try {
    // Create text search query
    const textSearchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } }
      ]
    };
    
    const results = await db.collection('knowledge')
      .find(textSearchQuery)
      .limit(limit)
      .toArray();
      
    return NextResponse.json({
      results,
      count: results.length,
      searchType: 'text'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Text search failed:', error);
    return NextResponse.json({
      error: 'Search failed',
      message: error.message
    }, { status: 500 });
  }
}