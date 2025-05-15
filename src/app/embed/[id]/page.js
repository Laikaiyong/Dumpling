"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import MessageItem from "../../components/messageItem";
import Link from "next/link";
import TokenChart from "@/app/components/tokenChart";
import SearchResults from "@/app/components/searchResults"; // Add this import

// Add useSpeech hook if you want to standardize voice functionality
import { useSpeech } from "@/app/hooks/useSpeech";

export default function EmbedPage({ params }) {
  const { id } = params;
  const [agent, setAgent] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  // Add state for showing thoughts
  const [showThoughts, setShowThoughts] = useState(false);
  const messagesEndRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioInput, setAudioInput] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM"); // Default ElevenLabs voice

  // Add this near the beginning of the EmbedPage component to handle URL parameters
  const [styling, setStyling] = useState({
    bg: "#0a0808",
    text: "#ffffff",
    button: "#ff3131",
    watermark: true,
  });

  // Add this helper function to the component
  const adjustColor = (hex, amount) => {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // Adjust values
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  // Parse URL query parameters for styling
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);

      const bgColor = urlParams.get("bg");
      const textColor = urlParams.get("text");
      const buttonColor = urlParams.get("button");
      const watermark = urlParams.get("watermark");

      setStyling({
        bg: bgColor ? `#${bgColor}` : "#0a0808",
        text: textColor ? `#${textColor}` : "#ffffff",
        button: buttonColor ? `#${buttonColor}` : "#ff3131",
        watermark: watermark !== "false",
      });
    }
  }, []);

  const speakText = async (text, messageIndex) => {
    if (isSpeaking) return;

    try {
      setIsSpeaking(true);
      setSpeakingMessageId(messageIndex);

      // Create a URL for the text
      const params = new URLSearchParams({
        text: text.substring(0, 1000), // Limit to 1000 chars
        voiceId: voiceId,
      });

      // Fetch the audio
      const audioRes = await fetch(
        `/api/tools/xilabs/speech?${params.toString()}`
      );

      if (!audioRes.ok) {
        throw new Error("Failed to convert text to speech");
      }

      // Get the audio blob
      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Store audio URL for this message
      setMessageAudios((prev) => ({
        ...prev,
        [messageIndex]: audioUrl,
      }));

      // Play the audio
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        // Don't revoke here - we'll keep it for replay
      };

      audio.play();
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  // Add this state variable for consistent audio management
  const [messageAudios, setMessageAudios] = useState({});
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  // Add cleanup effect for audio resources
  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      Object.values(messageAudios).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [messageAudios]);
  // Speech to Text
  const startRecording = async () => {
    try {
      setIsRecording(true);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        // Create blob from recorded chunks
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioInput(audioBlob);

        // Transcribe the audio
        await transcribeAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      });

      // Start recording for max 30 seconds
      mediaRecorder.start();

      // Stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 30000);

      // Store recorder reference to stop it later
      setMediaRecorder(mediaRecorder);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // Send to transcription API
      const response = await fetch("/api/tools/xilabs/text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();

      // Set the transcribed text as input
      if (data.text) {
        setInputMessage(data.text);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  // Add mediaRecorder state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  // Fetch agent data from MongoDB
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // Use the agent API endpoint to fetch data from MongoDB
        const response = await fetch(`/api/agent/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }
        const data = await response.json();
        setAgent(data.agent);
        setCapabilities(data.capabilities || []);

        // Initialize with a welcome message
        setMessages([
          {
            role: "assistant",
            content: `Hello! I'm ${data.agent.name}. How can I help you today?`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching agent data:", error);
        setError(
          "Could not load this agent. It may not exist or you may not have permission to view it."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!inputMessage.trim()) return;

    // Add user message to the chat
    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Identify agent capabilities
      const hasFinanceCapability = capabilities.some(
        (c) => c.name === "Price Tracking" || c.name === "Market Analysis"
      );

      const hasBlockchainCapability = capabilities.some(
        (c) => c.name === "Transaction Analysis" || c.name === "Wallet Insights"
      );

      const hasSearchCapability = capabilities.some(
        (c) => c.name === "Web Search" || c.name === "Knowledge Retrieval"
      );

      // Build system instruction with available tools information
      let enhancedSystemInstructions = agent.systemInstructions || "";

      if (hasFinanceCapability) {
        enhancedSystemInstructions += `\n\nYou have access to cryptocurrency market data. You can check prices, market caps, and trends.`;
      }

      if (hasBlockchainCapability) {
        enhancedSystemInstructions += `\n\nYou can analyze blockchain transactions and wallet data on Solana when provided with a wallet address.`;
      }

      if (hasSearchCapability) {
        enhancedSystemInstructions += `\n\nYou can search the web for information when answering questions.`;
      }

      // Always add voice capabilities info
      enhancedSystemInstructions += `\n\nYou can convert text to speech and transcribe speech to text for the user.`;

      // Step 1: Always perform knowledge base vector search (regardless of intent)
      let knowledgeResults = [];
      try {
        const knowledgeResponse = await fetch(`/api/knowledge/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: inputMessage, limit: 3 }),
        });

        if (knowledgeResponse.ok) {
          const knowledgeData = await knowledgeResponse.json();
          knowledgeResults = knowledgeData.results || [];
        }
      } catch (error) {
        console.error("Error searching knowledge base:", error);
      }

      // Update the search processing section (around line 308)
      // Step 2: Always perform web search (regardless of intent)
      let searchResults = [];
      try {
        // Only perform search if the agent has search capability
        if (hasSearchCapability) {
          const searchResponse = await fetch(`/api/tools/serper/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: inputMessage,
              num: 5, // Request 5 results maximum
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (
              searchData &&
              searchData.results &&
              searchData.results.length > 0
            ) {
              // Format search results for display
              searchResults = searchData.results
                .map((result) => ({
                  title: result.title || "Untitled",
                  link: result.link || "#",
                  snippet: result.snippet || "",
                  position: result.position,
                }))
                .slice(0, 3); // Take top 3 results

              // Process search results to add them to additional context
              if (searchResults.length > 0) {
                additionalContext += "\n\n### Recent web search results:\n";

                searchResults.forEach((result, index) => {
                  // Add result title with index
                  additionalContext += `\n#### ${index + 1}. ${
                    result.title || "Untitled"
                  }\n`;

                  // Add snippet if available
                  if (result.snippet) {
                    additionalContext += `${result.snippet}\n`;
                  }

                  // Add source link
                  if (result.link) {
                    additionalContext += `Source: ${result.link}\n`;
                  }
                });

                additionalContext +=
                  "\nThese search results may help answer the user's query.\n";
              }
            }
          }
        }
      } catch (error) {
        console.error("Error performing web search:", error);
      }

      // Modify the intent processing part of handleSendMessage

      // Step 3: Detect user intent using Together AI
      const intentResponse = await fetch("/api/tools/together", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputMessage,
          intentClassification: true,
        }),
      });

      // Parse intent results
      let intentData = null;
      let primaryIntent = "customer_support";
      let additionalContext = "";
      let tokenData = {};

      if (intentResponse.ok) {
        try {
          const intentResult = await intentResponse.json();
          intentData = intentResult.intent;
          primaryIntent = intentData?.primaryIntent || "customer_support";

          // Don't extract specific token or wallet data from intent service
        } catch (error) {
          console.error("Error parsing intent data:", error);
        }
      }

      // Step 6: Handle intent-specific data gathering
      if (primaryIntent === "token_price" && hasFinanceCapability) {
        try {
          // Extract token query from user message directly
          const query = inputMessage.toLowerCase();

          // Use token search API to find the token
          const tokenSearchResponse = await fetch(
            `/api/tools/coingecko/token?query=${encodeURIComponent(
              query
            )}&limit=5`
          );

          if (tokenSearchResponse.ok) {
            const tokenSearchData = await tokenSearchResponse.json();
            console.log(tokenSearchData);

            if (tokenSearchData.tokens && tokenSearchData.tokens.length > 0) {
              // Found tokens in our database - collect up to 3 tokens
              const foundTokens = tokenSearchData.tokens.slice(0, 3);

              // Add intro to context
              additionalContext += `\n\nAccording to your query, I found ${foundTokens.length} related tokens:\n`;

              // Loop through each token to add detailed information
              for (let i = 0; i < foundTokens.length; i++) {
                const token = foundTokens[i];

                // Add token header and basic info
                additionalContext += `\n### ${i + 1}. Token Information for ${
                  token.name
                } (${token.symbol?.toUpperCase()}) - ${
                  token.contractAddress || token.address || token.id
                }:\n`;

                // Add description if available
                if (token.description) {
                  additionalContext += `${token.description.slice(0, 200)}${
                    token.description.length > 200 ? "..." : ""
                  }\n`;
                }

                // Get detailed token information
                try {
                  const tokenId = token.id;
                  const tokenDetailsResponse = await fetch(
                    `/api/tools/coingecko/token/${tokenId}`
                  );

                  if (tokenDetailsResponse.ok) {
                    const tokenDetails = await tokenDetailsResponse.json();

                    // Add token price history if available
                    if (tokenDetails?.data?.market_data) {
                      const marketData = tokenDetails.data.market_data;
                      additionalContext += `- Current Price: $${parseFloat(
                        marketData.current_price?.usd || 0
                      ).toLocaleString()}\n`;
                      additionalContext += `- Price Change 24h: ${marketData.price_change_percentage_24h?.toFixed(
                        2
                      )}%\n`;
                      additionalContext += `- All Time High: $${parseFloat(
                        marketData.ath?.usd || 0
                      ).toLocaleString()}\n`;

                      // Add market cap and volume if available
                      if (marketData.market_cap?.usd) {
                        additionalContext += `- Market Cap: $${parseFloat(
                          marketData.market_cap.usd
                        ).toLocaleString()}\n`;
                      }
                      if (marketData.total_volume?.usd) {
                        additionalContext += `- 24h Volume: $${parseFloat(
                          marketData.total_volume.usd
                        ).toLocaleString()}\n`;
                      }
                    }
                  }
                } catch (error) {
                  console.error(
                    `Error fetching details for token ${token.name}:`,
                    error
                  );
                }

                // Add separator between tokens
                if (i < foundTokens.length - 1) {
                  additionalContext += "\n";
                }
              }

              // Prepare multiple tokens for the chart
              const tokensForChart = foundTokens.map((token) => ({
                id: token.id,
                tokenName: token.name,
                tokenSymbol: token.symbol,
                tokenAddress: token.contractAddress || token.id,
                description: token.description,
                logoUrl:
                  token.image?.large ||
                  token.image ||
                  token.logo ||
                  "https://static.vecteezy.com/system/resources/thumbnails/005/630/579/small/pixel-art-glasses-isolated-on-white-background-free-vector.jpg",
              }));

              // Store for use in the assistant message
              tokenData = tokensForChart;
            }
          }
        } catch (error) {
          console.error("Error fetching token data:", error);
        }
      } else if (
        primaryIntent === "wallet_analysis" &&
        hasBlockchainCapability
      ) {
        try {
          // Extract the wallet address from the message using regex instead of from intent
          const walletRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
          const matches = inputMessage.match(walletRegex);

          // Add useWallet hook at the component level (outside this function)
          // Import { useWallet } from '@solana/wallet-adapter-react' at the top of the file
          let walletAddress = null;

          if (matches && matches.length > 0) {
            walletAddress = matches[0];
          } else {
            // If no wallet address found in message, try to use connected wallet

            if (connected && publicKey) {
              walletAddress = publicKey.toString();
              additionalContext +=
                "\n\n### Using your connected wallet for analysis:\n";
              additionalContext += `Using wallet address: ${walletAddress.substring(
                0,
                6
              )}...${walletAddress.substring(walletAddress.length - 4)}\n`;
            } else {
              // No wallet address found in message and no wallet connected
              additionalContext += "\n\n### No valid wallet address detected\n";
              additionalContext +=
                "Please provide a Solana wallet address for analysis or connect your wallet.\n";
              return; // Exit early if no wallet address is available
            }
          }

          // 1. Fetch portfolio data
          const portfolioResponse = await fetch(
            `/api/tools/helius/portfolio?address=${walletAddress}`
          );

          if (portfolioResponse.ok) {
            const portfolioData = await portfolioResponse.json();

            if (portfolioData.portfolio) {
              additionalContext += `\n\n### Wallet Data for ${walletAddress}:\n`;

              if (portfolioData.portfolio.nativeBalance) {
                additionalContext += `- SOL Balance: ${portfolioData.portfolio.nativeBalance.sol}\n`;
              }

              if (
                portfolioData.portfolio.assets &&
                portfolioData.portfolio.assets.length > 0
              ) {
                additionalContext += `- Token Types: ${portfolioData.portfolio.assets.length}\n`;

                // Include top 3 tokens if available
                const tokens = portfolioData.portfolio.assets.slice(0, 3);
                if (tokens.length > 0) {
                  additionalContext += `- Top tokens:\n`;
                  tokens.forEach((token, i) => {
                    const tokenInfo =
                      token.content?.metadata?.name || token.id.substring(0, 8);
                    additionalContext += `  ${i + 1}. ${tokenInfo}\n`;
                  });
                }
              }
            }

            // 2. Fetch transaction data
            const txResponse = await fetch(
              `/api/tools/helius/transaction?address=${walletAddress}`
            );

            if (txResponse.ok) {
              const txData = await txResponse.json();

              if (Array.isArray(txData) && txData.length > 0) {
                additionalContext += `- Recent Transactions: ${txData.length}\n`;
                additionalContext += `- Latest Transaction: ${new Date(
                  txData[0].timestamp
                ).toLocaleString()}\n`;
              }
            }
          } else {
            // No wallet address found in the message
            additionalContext +=
              "\n\n### No valid wallet address detected in your message\n";
            additionalContext +=
              "Please provide a Solana wallet address for analysis.\n";
          }
        } catch (error) {
          console.error("Error fetching wallet data:", error);
        }
      }
      // Step 7: Send enhanced prompt to FetchAI
      const aiResponse = await fetch("/api/tools/fetchai/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: inputMessage + additionalContext,
          systemInstruction: enhancedSystemInstructions,
          temperature: 0.7,
          maxTokens: 1000, // Increased to handle more context
        }),
      });

      if (!aiResponse.ok) {
        throw new Error("Failed to get AI response");
      }

      const aiData = await aiResponse.json();
      const enhancedResponse = aiData.completion;

      // Create the assistant message with all the gathered data
      const assistantMessage = {
        role: "assistant",
        content: enhancedResponse,
        thought: aiData.thought,
        timestamp: new Date(),
        intentData: intentData,
        tokenData: primaryIntent === "token_price" ? tokenData : undefined,
        knowledgeResults:
          knowledgeResults.length > 0 ? knowledgeResults : undefined,
        searchResults: searchResults.length > 0 ? searchResults : undefined,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error handling message:", error);

      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0a0808] text-white p-4">
        <motion.div
          className="w-8 h-8 border-4 border-t-[#ff3131] border-r-[#ffcc00] border-b-[#ff3131] border-l-[#ffcc00] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a0808] text-white p-6">
        <div className="text-[#ff3131] text-xl mb-2">Error</div>
        <p className="text-center text-gray-400 mb-4">{error}</p>
        <Link href="/" className="text-[#ffcc00] hover:underline text-sm">
          Return to Homepage
        </Link>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0a0808] text-white p-6">
        <div className="text-[#ff3131] text-xl mb-2">Agent Not Found</div>
        <p className="text-center text-gray-400 mb-4">
          The agent you&apos;re looking for doesn&apos;t exist or you don&apos;t
          have permission to view it.
        </p>
        <Link href="/" className="text-[#ffcc00] hover:underline text-sm">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center">
      {/* Chat Widget - Responsive sizing */}
      <div
        className="w-full h-[80vh] sm:h-auto sm:max-h-[600px] sm:max-w-md sm:w-full shadow-xl rounded-lg overflow-hidden mx-2 sm:mx-auto"
        style={{ backgroundColor: styling.bg }}>
        {/* Header - update with styling */}
        <div
          className="p-3 flex justify-between items-center cursor-pointer"
          onClick={() => setMinimized(!minimized)}
          style={{
            background: `linear-gradient(to right, ${styling.bg}, ${adjustColor(
              styling.bg,
              -10
            )})`,
          }}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff3131] to-[#ffcc00] flex items-center justify-center text-black font-bold text-sm mr-2">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-medium" style={{ color: styling.text }}>
              {agent.name}
            </h3>
          </div>
          {/* Rest of header code... */}
        </div>

        {/* Update text color in the chat area */}
        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: styling.bg }}>
              {/* Messages - use custom text color */}
              <div className="h-[40vh] sm:h-[350px] overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}>
                      {/* User Message */}
                      <div
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}>
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-[#ff3131]/20 to-[#ffcc00]/20 text-white"
                              : message.error
                              ? "bg-red-900/20 border border-red-800/50 text-red-200"
                              : "bg-[#0f0f0f] border border-gray-800 text-gray-300"
                          }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                              {message.role === "user" ? "You" : agent.name}
                            </span>
                            <div className="flex items-center">
                              {message.role === "assistant" && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => speakText(message.content)}
                                  disabled={isSpeaking}
                                  className={`mr-2 p-1 rounded-full ${
                                    isSpeaking && speakingMessageId === index
                                      ? "bg-[#ffcc00]/20 text-[#ffcc00]"
                                      : "bg-transparent text-gray-500 hover:text-gray-300"
                                  }`}
                                  title="Speak this message">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728"
                                    />
                                  </svg>
                                </motion.button>
                              )}
                              {message.timestamp && (
                                <span className="text-xs opacity-50">
                                  {formatTime(message.timestamp)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="prose prose-invert max-w-none prose-sm">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      {/* Token Chart - if message is relevant to token prices */}
                      {message.role === "assistant" && message.tokenData && (
                        <TokenChart
                          tokenData={message.tokenData}
                          network="solana"
                        />
                      )}

                      {message.role === "assistant" &&
                        message.searchResults && (
                          <SearchResults
                            searchResults={message.searchResults}
                          />
                        )}

                      {/* AI Thoughts - only show if enabled and message has thoughts */}
                      {showThoughts &&
                        message.role === "assistant" &&
                        message.thought && (
                          <motion.div
                            className="flex justify-start mt-1 mb-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}>
                            <div className="max-w-[95%] px-3 py-2 bg-[#1a1a1a]/50 border border-[#ff3131]/20 rounded-lg">
                              <div className="flex items-center text-[#ff3131] mb-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                  />
                                </svg>
                                <span className="text-xs font-medium">
                                  Thought Process
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 font-mono bg-black/30 p-2 rounded overflow-auto max-h-32">
                                {Array.isArray(message.thought) ? (
                                  message.thought.map((thought, i) => (
                                    <p key={i} className="mb-1 break-words">
                                      {thought}
                                    </p>
                                  ))
                                ) : (
                                  <p className="break-words">
                                    {message.thought ||
                                      "No thought process recorded"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </motion.div>
                  ))}
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#1a1a1a] border border-gray-800 text-gray-400 px-4 py-3 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t"
                style={{ borderColor: adjustColor(styling.bg, -20) }}>
                {/* Chat Input with Voice Controls */}
                <div className="p-4 border-t border-gray-800">
                  <div className="flex space-x-2">
                    {/* Voice Input Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-3 rounded-md ${
                        isRecording
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222]"
                      }`}
                      title={
                        isRecording ? "Stop Recording" : "Start Voice Input"
                      }>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRecording
                              ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                              : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          }
                        />
                      </svg>
                    </motion.button>

                    {/* Text Input */}
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleSendMessage(e)
                      }
                      placeholder={
                        isRecording
                          ? "Listening..."
                          : `Message ${agent.name}...`
                      }
                      className="flex-1 bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                      disabled={isRecording}
                    />

                    {/* Send Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={isTyping || isRecording || !inputMessage.trim()}
                      className={`px-6 py-3 text-black font-medium rounded-md ${
                        isTyping || isRecording || !inputMessage.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      style={{ backgroundColor: styling.button }}>
                      Send
                    </motion.button>

                    {/* Text-to-Speech Button (for latest message) */}
                    {messages.length > 0 &&
                      messages[messages.length - 1].role === "assistant" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            speakText(messages[messages.length - 1].content)
                          }
                          disabled={isSpeaking}
                          className={`p-3 rounded-md ${
                            isSpeaking
                              ? "bg-[#ffcc00] text-black animate-pulse"
                              : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222]"
                          }`}
                          title={
                            isSpeaking ? "Speaking..." : "Speak Last Message"
                          }>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l3.536-3.536M6.343 6.343l-3.536 3.536m0 7.072l3.536 3.536M15.536 15.536l3.536 3.536M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7"
                            />
                          </svg>
                        </motion.button>
                      )}
                  </div>
                </div>
              </form>

              {/* Footer with branding */}
              {styling.watermark && (
                <div
                  className="px-4 py-2 border-t flex justify-center"
                  style={{
                    borderColor: adjustColor(styling.bg, -20),
                    backgroundColor: styling.bg,
                  }}>
                  <Link
                    href={process.env.NEXT_PUBLIC_BASE_URL || "https://dumpling.ai"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] flex items-center"
                    style={{ color: adjustColor(styling.text, -30) }}>
                    Powered by
                    <span className="ml-1 flex items-center">
                      Dumpling
                      <span className="text-[#ff3131] mx-0.5">.</span>
                      AI
                    </span>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
