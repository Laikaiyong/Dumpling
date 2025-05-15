import { NextResponse } from 'next/server';

/**
 * POST handler for FetchAI chat completions
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with completion data
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      prompt, 
      systemInstruction, 
      temperature = 0.7, 
      maxTokens = 500,
      stream = false,
      model = "asi1-mini",
    } = body;

    if (!prompt) {
      return NextResponse.json({ 
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    // Get API key from environment variables
    const apiKey = process.env.FETCHAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'FetchAI API key is not configured' 
      }, { status: 500 });
    }

    // Build messages array
    const messages = [];
    
    // Add system instruction if provided
    if (systemInstruction) {
      messages.push({
        role: "system",
        content: systemInstruction
      });
    }
    
    // Add user prompt
    messages.push({
      role: "user",
      content: prompt
    });

    // Build request payload
    const payload = {
      model,
      messages,
      temperature,
      stream,
      max_tokens: maxTokens
    };

    // Make request to FetchAI API
    const response = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    // Parse response
    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If we can't parse the error as JSON, use the default error message
      }
      
      return NextResponse.json({ 
        error: 'Failed to get completion',
        message: errorMessage
      }, { status: response.status });
    }

    const data = await response.json();

    console.log(data.choices[0].message)
    
    // Format and return the response
    return NextResponse.json({
      completion: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      thought: data.thought,
      id: data.id
    }, { status: 200 });

  } catch (error) {
    console.error('Error in FetchAI completion API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate completion',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * GET handler to provide information about this endpoint
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with endpoint info
 */
export async function GET(request) {
  return NextResponse.json({
    info: 'FetchAI Chat Completion API',
    usage: 'Send a POST request with a prompt and optional systemInstruction',
    supportedModels: ['asi1-mini'],
    examplePayload: {
      prompt: "Explain the concept of decentralized AI.",
      systemInstruction: "You are a helpful assistant specialized in Web3 technologies.",
      temperature: 0.7,
      maxTokens: 500
    }
  }, { status: 200 });
}