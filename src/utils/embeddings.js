/**
 * Utility for generating text embeddings using Xenova transformers with nomic-embed-text-v1 model
 */
import { pipeline } from '@xenova/transformers';

// Initialize the embedding pipeline lazily to improve performance
let embedder = null;

// Generate embeddings using Xenova transformers and nomic-embed-text-v1 model
export async function generateEmbedding(text) {
  try {
    // Initialize embedder if not already done
    if (!embedder) {
      embedder = await pipeline(
        'feature-extraction', 
        'Xenova/nomic-embed-text-v1'
      );
    }
    
    // Generate embedding
    const results = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(results.data);
  } catch (error) {
    console.error('Error generating embedding with Xenova transformers:', error);
    
    // Return a mock embedding for development if embedding fails
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock embedding as fallback');
      // Create a mock embedding with similar dimensions to nomic-embed-text-v1
      return Array(768).fill().map(() => Math.random() * 2 - 1);
    }
    
    throw error;
  }
}

// Helper function to calculate cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

// Helper function for manual vector search (if MongoDB Atlas vector search is not available)
export async function manualVectorSearch(db, collection, queryVector, limit = 10) {
  try {
    const allDocs = await db.collection(collection).find({}).toArray();
    
    return allDocs
      .map(doc => ({
        ...doc,
        score: doc.descriptionVector ? cosineSimilarity(queryVector, doc.descriptionVector) : 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error performing manual vector search:', error);
    throw error;
  }
}