import axios from 'axios';

/**
 * Process a document through OCR using Mistral AI
 * @param {File} file - The file to process
 * @returns {Promise<object>} The extracted text and verification data
 */
export async function processDocumentOCR(file) {
  try {
    // Read file data as base64
    const fileData = await fileToBase64(file);
    
    const response = await axios.post(
      'https://api.mistral.ai/v1/ocr',
      {
        model: "mistral-large-pdf",
        document: {
          document_base64: fileData,
          document_name: file.name,
          type: "document_base64"
        },
        pages: [],
        include_image_base64: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract text from the response
    let extractedText = '';
    if (response.data && response.data.text) {
      extractedText = response.data.text;
    } else if (response.data && response.data.pages) {
      extractedText = response.data.pages.map(page => page.text).join('\n');
    }
    
    // Generate content hash for verification
    const verificationData = await verifyAiGeneratedContent(extractedText);
    
    return {
      text: extractedText,
      verification: verificationData
    };
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

/**
 * Process a URL through OCR using Mistral AI
 * @param {string} url - The web URL to process
 * @returns {Promise<object>} The extracted text and verification data
 */
export async function processUrlOCR(url) {
  try {
    const response = await axios.post(
      'https://api.mistral.ai/v1/ocr',
      {
        model: "mistral-large-pdf",
        document: {
          document_url: url,
          document_name: new URL(url).hostname,
          type: "document_url"
        },
        pages: [],
        include_image_base64: false
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract text from the response
    let extractedText = '';
    if (response.data && response.data.text) {
      extractedText = response.data.text;
    } else if (response.data && response.data.pages) {
      extractedText = response.data.pages.map(page => page.text).join('\n');
    }
    
    // Generate content hash for verification
    const verificationData = await verifyAiGeneratedContent(extractedText);
    
    return {
      text: extractedText,
      verification: verificationData
    };
  } catch (error) {
    console.error('Error in URL OCR processing:', error);
    throw new Error(`URL OCR processing failed: ${error.message}`);
  }
}

/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string representation of the file
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // Extract the base64 data from the result
      // reader.result looks like "data:application/pdf;base64,XXXXXXXX"
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    
    reader.onerror = error => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Verify AI-generated content by generating a content hash
 * This would call the verify-content API
 */
async function verifyAiGeneratedContent(content) {
  try {
    const response = await fetch('/api/verify-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        contentType: 'TEXT'
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying content:', error);
    return {
      verified: false,
      error: error.message
    };
  }
}