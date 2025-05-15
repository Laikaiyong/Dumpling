import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/mongodb';
import { generateEmbedding } from '@/utils/embeddings';
import { processDocumentOCR } from '@/utils/ocr';
import formidable from 'formidable';
import { ObjectId } from 'mongodb';

// Disable default body parser to handle form data with files
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST - Create a new knowledge entry from file
 */
export async function POST(request) {
  try {
    // Parse form data with files
    const { fields, files } = await parseFormData(request);
    const { agentId } = fields;
    
    if (!agentId) {
      return NextResponse.json({ 
        error: 'Agent ID is required' 
      }, { status: 400 });
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    const knowledgeEntries = [];
    
    // Process each uploaded file
    for (const file of Object.values(files)) {
      try {
        // Extract text using OCR for documents with in-memory processing
        const ocrResult = await processDocumentOCR(file);
        const fileContent = ocrResult.text;
        
        // Generate embedding from the extracted text
        const embedding = await generateEmbedding(fileContent);
        
        // Create knowledge entry
        const knowledgeEntry = {
          title: file.name,
          content: fileContent,
          embedding,
          agentId: new ObjectId(agentId),
          fileType: file.type,
          fileSize: file.size,
          verification: ocrResult.verification,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Store in database
        const result = await db.collection('knowledge').insertOne(knowledgeEntry);
        
        knowledgeEntries.push({
          _id: result.insertedId,
          title: knowledgeEntry.title,
          success: true,
          verification: ocrResult.verification
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        knowledgeEntries.push({
          title: file.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Process URL if provided
    if (fields.url) {
      try {
        const url = fields.url;
        
        // Process the URL with OCR
        const ocrResult = await processUrlOCR(url);
        const urlContent = ocrResult.text;
        
        // Generate embedding from the extracted text
        const embedding = await generateEmbedding(urlContent);
        
        // Create knowledge entry
        const knowledgeEntry = {
          title: new URL(url).hostname,
          content: urlContent,
          embedding,
          agentId: new ObjectId(agentId),
          sourceType: 'url',
          sourceUrl: url,
          verification: ocrResult.verification,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Store in database
        const result = await db.collection('knowledge').insertOne(knowledgeEntry);
        
        knowledgeEntries.push({
          _id: result.insertedId,
          title: knowledgeEntry.title,
          success: true,
          verification: ocrResult.verification
        });
      } catch (error) {
        console.error(`Error processing URL ${fields.url}:`, error);
        knowledgeEntries.push({
          title: new URL(fields.url).hostname,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      entries: knowledgeEntries,
      success: knowledgeEntries.some(entry => entry.success)
    }, { status: 200 });
  } catch (error) {
    console.error('Error in knowledge upload API:', error);
    return NextResponse.json({ 
      error: 'Failed to process knowledge upload',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Parse form data with files
 * @param {Request} request - The HTTP request with form data
 */
async function parseFormData(request) {
  return new Promise((resolve, reject) => {
    const form = formidable({ 
      multiples: true,
      maxFileSize: 50 * 1024 * 1024 // 50MB
    });
    
    // Get the request body as a Node.js ReadableStream
    const readableStream = request.body;
    
    form.parse(readableStream, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}