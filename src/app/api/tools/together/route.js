import { NextResponse } from "next/server";

/**
 * POST handler for Together AI chat completions
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} JSON response with completion data and intent classification
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      query,
      systemInstruction,
      intentClassification = true,
      model = "Qwen/Qwen3-235B-A22B-fp8-tput",
    } = body;

    if (!query) {
      return NextResponse.json(
        {
          error: "Query is required",
        },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Together AI API key is not configured",
        },
        { status: 500 }
      );
    }

    // Build the messages array
    const messages = [];

    // Add system instruction for intent classification
    messages.push({
      role: "system",
      content: `You are an intent detection system. Analyze the user's message and determine if they are asking about:
1. Token/cryptocurrency/meme coin analysis or solana blockchain analysis
2. Blockchain wallet analysis or transactions
3. Customer Support question on FAQ

Return a JSON object with the following format:
{
  "primaryIntent": "token_price" | "wallet_analysis" | "customer_support",
  "confidence": <float between 0-1>,
  "searchQuery": <search query if web search intent, null otherwise>
}
Always fallback to token_price when in doubt`,
    });

    // Add the user query
    messages.push({
      role: "user",
      content: query,
    });

    // Prepare the request payload
    const payload = {
      model,
      messages,
      temperature: 0.1, // Low temperature for more deterministic output for intent detection
      max_tokens: 1000,
      tools: intentClassification
        ? [
            {
              type: "function",
              function: {
                name: "detect_intent",
                description: "Detect the user's intent and related entities",
                parameters: {
                  type: "object",
                  properties: {
                    primaryIntent: {
                      type: "string",
                      enum: [
                        "token_price",
                        "wallet_analysis",
                        "customer_support",
                      ],
                      description: "The primary intent of the user's query",
                    },
                    confidence: {
                      type: "number",
                      description: "Confidence score between 0 and 1",
                    },
                    searchQuery: {
                      type: "string",
                      nullable: true,
                      description: "Search query if web search intent detected",
                    },
                  },
                  required: ["primaryIntent", "confidence"],
                },
              },
            },
          ]
        : undefined,
      tool_choice: intentClassification
        ? { type: "function", function: { name: "detect_intent" } }
        : undefined,
    };

    // Make request to Together API
    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    // Parse response
    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If we can't parse the error as JSON, use the default error message
      }

      return NextResponse.json(
        {
          error: "Failed to get completion",
          message: errorMessage,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Format and return the response
    let result;

    if (
      intentClassification &&
      data.choices[0]?.message?.tool_calls?.[0]?.function
    ) {
      // Parse the tool call result
      try {
        console.log(data.choices[0].message.tool_calls[0].function.arguments);
        const toolCallResult = JSON.parse(
          data.choices[0].message.tool_calls[0].function.arguments
        );
        result = {
          intent: toolCallResult,
          model: data.model,
          id: data.id,
        };
      } catch (e) {
        result = {
          error: "Failed to parse intent detection result",
          rawResponse: data.choices[0]?.message,
          model: data.model,
          id: data.id,
        };
      }
    } else {
      // Return regular completion
      result = {
        completion: data.choices[0]?.message?.content,
        model: data.model,
        id: data.id,
      };
    }

    console.log(result);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in Together AI API:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
