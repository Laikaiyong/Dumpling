"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import TokenChart from "@/app/components/tokenChart";
import { ElevenLabsClient, play } from "elevenlabs";
import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { initVerifyAiProgram, registerContent, verifyAiContent, getContentVerification } from "@/utils/solana";
import { toast } from "react-hot-toast"; // You'll need to install this package
import VerificationBadge from "@/app/components/verificationBadge"; // We'll create this component later


import { useWallet } from "@solana/wallet-adapter-react";
import { useSpeech } from "@/app/hooks/useSpeech";
// Import our new components
import { AudioPlayer } from "@/app/components/audioPlayer";
import ApiKeyManager from "@/app/components/apikeyManager";

import SearchResults from "@/app/components/searchResults";

export default function AgentPage() {
  const params = useParams(); // Get params with the hook
  const id = params?.id; // Safely access the id
  const [agent, setAgent] = useState(null);
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [apiKeys, setApiKeys] = useState({
    fetchai: "",
    coingecko: "",
    helius: "",
  });
  const [showThoughts, setShowThoughts] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey, connected } = useWallet();

  const [isRecording, setIsRecording] = useState(false);
  const [audioInput, setAudioInput] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceId, setVoiceId] = useState("JBFqnCBsd6RMkjVDRZzb"); // Default ElevenLabs voice
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [messageAudios, setMessageAudios] = useState({});

  const [verifyContent, setVerifyContent] = useState(false);
  const [contentVerification, setContentVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [contentPubkey, setContentPubkey] = useState(null);

  const anchorWallet = useAnchorWallet();

  // Remove the embedType state variable around line 45
  // const [embedType, setEmbedType] = useState("iframe");
  // Keep the other state variables
  const [bgColor, setBgColor] = useState("#0a0808");
  const [textColor, setTextColor] = useState("#ffffff");
  const [buttonColor, setButtonColor] = useState("#ff3131");
  const [showWatermark, setShowWatermark] = useState(true);
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("700px");
  // Remove this state as it's only used for script embed
  // const [position, setPosition] = useState("right");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState(false);

  const handleVerifyContent = async (messageIndex) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet to verify content");
      return;
    }

    if (!anchorWallet) {
      toast.error("Wallet adapter not initialized properly");
      return;
    }

    const message = messages[messageIndex];
    if (!message || message.role !== "assistant") {
      toast.error("Only AI responses can be verified");
      return;
    }

    setVerifying(true);
    try {
      // Initialize Anchor program
      const program = initVerifyAiProgram(anchorWallet);
      
      // Register the content first
      const modelName = "FetchAI";
      const modelVersion = "1.0";
      const metadata = JSON.stringify({
        agentId: id,
        timestamp: message.timestamp,
        userQuery: messages[messageIndex - 1]?.content || ""
      });

      const registrationResult = await registerContent(
        program,
        publicKey,
        message.content,
        modelName,
        modelVersion,
        metadata
      );

      if (!registrationResult.success) {
        throw new Error(registrationResult.error || "Failed to register content");
      }

      // Save content public key for later use
      setContentPubkey(registrationResult.contentPubkey);

      // Now verify the content
      const verificationResult = await verifyAiContent(
        program,
        publicKey,
        message.content,
        registrationResult.contentPubkey,
        modelName,
        modelVersion
      );

      if (!verificationResult.success) {
        throw new Error(verificationResult.error || "Content verification failed");
      }

      // Get verification details
      const verificationDetails = await getContentVerification(
        program, 
        registrationResult.contentPubkey
      );

      setContentVerification(verificationDetails);
      
      // Update the message with verification information
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...message,
        verified: verificationResult.verified,
        verificationSignature: verificationResult.signature,
        contentPubkey: registrationResult.contentPubkey.toString()
      };
      
      setMessages(updatedMessages);
      toast.success("Content verified successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(`Verification failed: ${error.message}`);
      setContentVerification({ success: false, error: error.message });
    } finally {
      setVerifying(false);
    }
  };

  // Add this function with the other functions in the component
  const copyEmbedCode = () => {
    const code = `<iframe
  src="${
    process.env.NEXT_PUBLIC_BASE_URL || "https://dumpling.ai"
  }/embed/${id}?bg=${bgColor.replace("#", "")}&text=${textColor.replace(
      "#",
      ""
    )}&button=${buttonColor.replace("#", "")}&watermark=${showWatermark}"
  width="${width}"
  height="${height}"
  style="border:none;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
  allow="microphone"
></iframe>`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const elevenLabsClient = useRef(
    new ElevenLabsClient({
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "", // Use environment variable
    })
  );

  const {
    speak,
    stopSpeaking,
    setVoice,
    isLoading: isGeneratingVoice,
    currentVoiceId,
  } = useSpeech(process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY);

  const speakText = async (text, messageIndex) => {
    if (!inputMessage.trim() && isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      setSpeakingMessageId(messageIndex);
      
      // Direct ElevenLabs API call
      const response = await fetch(`/api/tools/elevenlabs/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limit text length
          voiceId: voiceId || "XB0fDUnXU5powFXDhCwa", // Use the voice from curl example as fallback
          modelId: "eleven_multilingual_v2",
          outputFormat: "mp3_44100_128"
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      // Get audio as blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Cache the audio URL for this message
      setMessageAudios((prev) => ({
        ...prev,
        [messageIndex]: audioUrl,
      }));
      
      // Play the audio
      const audio = new Audio(audioUrl);
      audio.onended = handleAudioEnded;
      audio.play();
      
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  };

  // Handle audio finished playing
  const handleAudioEnded = () => {
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  };

  // Updated transcribeAudio function using ElevenLabs
  const transcribeAudio = async (audioBlob) => {
    try {
      // Use ElevenLabs client to convert speech to text
      const transcription = await elevenLabsClient.current.speechToText.convert(
        {
          file: audioBlob,
          model_id: "scribe_v1",
          tag_audio_events: true,
          language_code: "eng",
        }
      );

      // Set the transcribed text as input
      if (transcription && transcription.text) {
        setInputMessage(transcription.text);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

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

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Add mediaRecorder state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  // Fetch agent data
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const response = await fetch(`/api/agent/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }
        const data = await response.json();
        setAgent(data.agent);
        setCapabilities(data.capabilities);
        setEditData({
          name: data.agent.name,
          description: data.agent.description,
          systemInstructions: data.agent.systemInstructions || "",
          type: data.agent.type || "General",
        });

        // Initialize with a welcome message
        setMessages([
          {
            role: "assistant",
            content: `Hello! I'm ${data.agent.name}. How can I help you today?`,
            timestamp: new Date(),
          },
        ]);

        // Fetch API keys for this user
        const keysResponse = await fetch("/api/api-keys");
        if (keysResponse.ok) {
          const keysData = await keysResponse.json();
          setApiKeys({
            fetchai: keysData.fetchai || "",
            coingecko: keysData.coingecko || "",
            helius: keysData.helius || "",
          });
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id]);

  // Add this handler for adding API keys
  const handleAddApiKey = async (e) => {
    e.preventDefault();
    setSavingApiKey(true);

    const formData = new FormData(e.target);
    const service = formData.get("service");
    const apiKey = formData.get("apiKey");
    let serviceName = service;

    // Handle custom service names
    if (service === "custom") {
      const customName = formData.get("customService")?.trim();
      if (!customName) {
        alert("Please provide a name for the custom service");
        setSavingApiKey(false);
        return;
      }
      serviceName = customName;
    }

    try {
      const response = await fetch(`/api/agent/${id}/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: serviceName,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save API key");
      }

      setShowApiKeyModal(false);
    } catch (error) {
      console.error("Error saving API key:", error);
      alert("Failed to save API key. Please try again.");
    } finally {
      setSavingApiKey(false);
    }
  };

  // Add handler for saving API keys in bulk (used when deleting a key)
  const handleSaveApiKeys = async (updatedKeys) => {
    try {
      const response = await fetch(`/api/agent/${id}/keys`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keys: updatedKeys,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update API keys");
      }
    } catch (error) {
      console.error("Error updating API keys:", error);
      alert("Failed to update API keys. Please try again.");
    }
  };

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

  // Handle updating agent
  const handleUpdateAgent = async () => {
    setSaveStatus("saving");

    try {
      const response = await fetch(`/api/agent/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editData.name,
          description: editData.description,
          systemInstructions: editData.systemInstructions,
          type: editData.type,
          capabilities: agent.capabilities, // Keep existing capabilities
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent");
      }

      // Update local state
      setAgent({
        ...agent,
        name: editData.name,
        description: editData.description,
        systemInstructions: editData.systemInstructions,
        type: editData.type,
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating agent:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  // Handle delete agent
  const handleDeleteAgent = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/agent/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete agent");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert("Failed to delete the agent. Please try again.");
    }
  };

  // Handle edit field changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c]">
        <Navbar isDashboard={true} />
        <div className="flex min-h-screen pt-16">
          <Sidebar activePage="/dashboard" />
          <div className="flex-1 p-6 flex items-center justify-center">
            <motion.div
              className="w-12 h-12 border-4 border-t-[#ff3131] border-r-[#ffcc00] border-b-[#ff3131] border-l-[#ffcc00] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c]">
        <Navbar isDashboard={true} />
        <div className="flex min-h-screen pt-16">
          <Sidebar activePage="/dashboard" />
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold text-[#ff3131] mb-4">
                Agent Not Found
              </h2>
              <p className="text-gray-400 mb-8">
                The agent you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have permission to view it.
              </p>
              <Link href="/dashboard">
                <button className="px-6 py-3 bg-[#1a1a1a] border border-gray-800 rounded-md hover:bg-[#222] transition-colors">
                  Return to Dashboard
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c]">
      <Navbar isDashboard={true} />
      <div className="flex min-h-screen pt-16">
        <Sidebar activePage="/dashboard" />
        <div className="flex-1 p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 relative">
            <motion.div
              className="absolute left-[-15px] top-0 h-full w-1"
              style={{
                background: "linear-gradient(to bottom, #ff3131, transparent)",
                boxShadow: "0 0 8px rgba(255,49,49,0.5)",
              }}
              animate={{ height: ["0%", "100%"] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] to-[#ffcc00]">
                {agent.name}
              </h1>

              <div className="flex space-x-2">
                {!editMode ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md text-[#ffcc00] hover:bg-[#222] transition-colors">
                      Edit Agent
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDeleteAgent}
                      className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md text-[#ff3131] hover:bg-[#222] transition-colors">
                      Delete
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md text-gray-400 hover:bg-[#222] transition-colors">
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpdateAgent}
                      className="px-4 py-2 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] text-black font-medium rounded-md relative"
                      disabled={saveStatus === "saving"}>
                      {saveStatus === "saving" && (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-black inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {saveStatus === "saving"
                        ? "Saving..."
                        : saveStatus === "saved"
                        ? "Saved!"
                        : saveStatus === "error"
                        ? "Error!"
                        : "Save Changes"}
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-400 mt-2">
              {editMode ? (
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                  rows="2"
                />
              ) : (
                agent.description
              )}
            </p>

            {/* Decorative line */}
            <svg className="w-full h-1 mt-4" viewBox="0 0 400 2">
              <motion.path
                d="M0,1 L400,1"
                stroke="url(#redGoldGradient)"
                strokeWidth="1"
                strokeDasharray="3,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
              />
              <defs>
                <linearGradient
                  id="redGoldGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0">
                  <stop offset="0%" stopColor="#ff3131" />
                  <stop offset="100%" stopColor="#ffcc00" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-800">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("chat")}
                className={`pb-3 px-1 ${
                  activeTab === "chat"
                    ? "border-b-2 border-[#ff3131] text-white font-medium"
                    : "text-gray-400 hover:text-gray-300"
                }`}>
                Chat
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`pb-3 px-1 ${
                  activeTab === "settings"
                    ? "border-b-2 border-[#ff3131] text-white font-medium"
                    : "text-gray-400 hover:text-gray-300"
                }`}>
                Settings
              </button>
              <button
                onClick={() => setActiveTab("embed")}
                className={`pb-3 px-1 ${
                  activeTab === "embed"
                    ? "border-b-2 border-[#ff3131] text-white font-medium"
                    : "text-gray-400 hover:text-gray-300"
                }`}>
                Embed
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}>
              {/* Chat Tab */}
              {activeTab === "chat" && (
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-lg h-[calc(100vh-220px)] flex flex-col">
                  {/* Chat Controls - Add Thought Toggle */}
                  <div className="border-b border-gray-800 p-2 flex justify-between">
                    <div> </div>
                    <button
                      onClick={() => setShowThoughts(!showThoughts)}
                      className={`text-xs px-2 py-1 rounded flex items-center ${
                        showThoughts
                          ? "bg-[#ff3131]/20 text-[#ff3131]"
                          : "bg-[#0f0f0f] text-gray-400 hover:bg-[#222]"
                      }`}>
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
                      {showThoughts ? "Hide AI Thoughts" : "Show AI Thoughts"}
                    </button>
                  </div>
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
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

                                {/* Add verification badge for AI messages */}
              {message.role === "assistant" && (
                message.verified ? (
                  <span className="ml-2 text-xs flex items-center text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified on Solana
                  </span>
                ) : (
                  <button
                    onClick={() => handleVerifyContent(index)}
                    disabled={verifying}
                    className="ml-2 text-xs px-2 py-0.5 rounded bg-[#252525] hover:bg-[#303030] text-gray-400 flex items-center"
                  >
                    {verifying ? (
                      <>
                        <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verify on Solana
                      </>
                    )}
                  </button>
                )
              )}
                                <div className="flex items-center">
                                  {message.role === "assistant" && (
                                    <div className="flex items-center">
                                      {isSpeaking &&
                                      speakingMessageId === index ? (
                                        // Show audio player when speaking
                                        <AudioPlayer
                                          audioUrl={messageAudios[index]}
                                          onEnded={handleAudioEnded}
                                        />
                                      ) : (
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() =>
                                            speakText(message.content, index)
                                          }
                                          disabled={isSpeaking}
                                          className={`mr-2 p-1 rounded-full bg-transparent text-gray-500 hover:text-gray-300`}
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
                                  )}
                                </div>
                              </div>
                              <div className="prose prose-invert max-w-none prose-sm">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>

                              {message.verified && (
            <div className="mt-2 border-t border-gray-800 pt-1 text-xs text-gray-500">
              <a 
                href={`https://solscan.io/tx/${message.verificationSignature}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Solscan
              </a>
            </div>
          )}
                            </div>
                          </div>

                          {/* Token Chart - if message is relevant to token prices */}
                          {message.role === "assistant" &&
                            message.tokenData && (
                              <TokenChart
                                tokenData={message.tokenData}
                                network="solana"
                              />
                            )}

                          {/* Search Results - if message contains search results */}
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
                      {/* ...existing typing indicator... */}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-[#0f0f0f] border border-gray-800 text-gray-400 px-4 py-3 rounded-lg">
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
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          handleSendMessage(e)
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
                        disabled={
                          isTyping || isRecording || !inputMessage.trim()
                        }
                        className={`px-6 py-3 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] text-black font-medium rounded-md ${
                          isTyping || isRecording || !inputMessage.trim()
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}>
                        Send
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-lg p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editMode ? editData.name : agent.name}
                        onChange={handleEditChange}
                        disabled={!editMode}
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">
                        Agent Type
                      </label>
                      <select
                        name="type"
                        value={
                          editMode ? editData.type : agent.type || "General"
                        }
                        onChange={handleEditChange}
                        disabled={!editMode}
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]">
                        <option value="General">General</option>
                        <option value="Finance">Finance</option>
                        <option value="Analytics">Analytics</option>
                        <option value="Support">Support</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">
                        System Instructions
                      </label>
                      <textarea
                        name="systemInstructions"
                        value={
                          editMode
                            ? editData.systemInstructions
                            : agent.systemInstructions || ""
                        }
                        onChange={handleEditChange}
                        disabled={!editMode}
                        rows="6"
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                        placeholder={
                          editMode
                            ? "Instructions that define your agent's behavior and knowledge..."
                            : "No system instructions provided."
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        System instructions shape the behavior and knowledge of
                        your AI agent.
                      </p>
                    </div>

                    {/* New API Keys section */}
                    <ApiKeyManager
                      agent={agent}
                      id={id}
                      publicKey={publicKey}
                      agentApiKeys={apiKeys}
                      setAgentApiKeys={setApiKeys}
                    />

                    <div>
                      <h3 className="text-lg font-medium text-[#ffcc00] mb-3">
                        Capabilities
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {capabilities.map((capability) => (
                          <div
                            key={capability._id}
                            className="p-3 bg-[#0f0f0f] border border-gray-800 rounded-lg flex items-center">
                            <div className="w-3 h-3 rounded-full bg-[#ff3131] mr-2"></div>
                            <span>{capability.name}</span>
                          </div>
                        ))}
                        {capabilities.length === 0 && (
                          <p className="text-gray-500 italic">
                            No capabilities configured.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Embed Tab */}
              {activeTab === "embed" && (
                <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-lg p-6">
                  <h2 className="text-xl font-bold text-[#ffcc00] mb-4">
                    Embed Your Agent
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Customize and generate code to embed this agent on your
                    website.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customization Options */}
                    <div className="space-y-6">
                      {/* Remove the embed type selection */}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Background Color
                          </label>
                          <div className="flex">
                            <input
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="h-10 w-10 rounded overflow-hidden"
                            />
                            <input
                              type="text"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="flex-1 ml-2 p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Text Color
                          </label>
                          <div className="flex">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="h-10 w-10 rounded overflow-hidden"
                            />
                            <input
                              type="text"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="flex-1 ml-2 p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Button Color
                          </label>
                          <div className="flex">
                            <input
                              type="color"
                              value={buttonColor}
                              onChange={(e) => setButtonColor(e.target.value)}
                              className="h-10 w-10 rounded overflow-hidden"
                            />
                            <input
                              type="text"
                              value={buttonColor}
                              onChange={(e) => setButtonColor(e.target.value)}
                              className="flex-1 ml-2 p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Show Watermark
                          </label>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showWatermark}
                              onChange={(e) =>
                                setShowWatermark(e.target.checked)
                              }
                              className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff3131]"></div>
                            <span className="ms-3 text-sm text-gray-300">
                              {showWatermark ? "Visible" : "Hidden"}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Width
                          </label>
                          <input
                            type="text"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            className="w-full p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                            placeholder="e.g. 100% or 400px"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Height
                          </label>
                          <input
                            type="text"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full p-2 bg-[#0a0a0a] border border-gray-800 rounded-lg"
                            placeholder="e.g. 500px"
                          />
                        </div>
                      </div>

                      {/* Remove the position setting */}
                    </div>

                    {/* Preview and Code */}
                    <div className="space-y-4">
                      <div className="bg-[#0a0a0a] p-4 rounded-lg">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-[#ffcc00]">
                            iframe Embed
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowPreview(false)}
                              className={`px-3 py-1 text-xs rounded ${
                                !showPreview
                                  ? "bg-[#ff3131] text-white"
                                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222]"
                              }`}>
                              Code
                            </button>
                            <button
                              onClick={() => setShowPreview(true)}
                              className={`px-3 py-1 text-xs rounded ${
                                showPreview
                                  ? "bg-[#ff3131] text-white"
                                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222]"
                              }`}>
                              Preview
                            </button>
                          </div>
                        </div>

                        {showPreview ? (
                          <div
                            className="border border-gray-800 rounded-lg overflow-hidden"
                            style={{ height: height }}>
                            <iframe
                              src={`/embed/${id}?bg=${bgColor.replace(
                                "#",
                                ""
                              )}&text=${textColor.replace(
                                "#",
                                ""
                              )}&button=${buttonColor.replace(
                                "#",
                                ""
                              )}&watermark=${showWatermark}`}
                              width="100%"
                              height="100%"
                              style={{ border: "none" }}
                              allow="microphone"></iframe>
                          </div>
                        ) : (
                          <div className="relative">
                            <pre className="bg-[#000000] p-3 rounded-lg overflow-auto max-h-64 text-sm text-gray-300 font-mono">
                              {`<iframe
  src="${
    process.env.NEXT_PUBLIC_BASE_URL || "https://dumpling.ai"
  }/embed/${id}?bg=${bgColor.replace("#", "")}&text=${textColor.replace(
                                "#",
                                ""
                              )}&button=${buttonColor.replace(
                                "#",
                                ""
                              )}&watermark=${showWatermark}"
  width="${width}"
  height="${height}"
  style="border:none;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
  allow="microphone"
></iframe>`}
                            </pre>
                            <button
                              onClick={copyEmbedCode}
                              className="absolute top-2 right-2 p-2 bg-[#1a1a1a] rounded hover:bg-[#2a2a2a]">
                              {copiedCode ? (
                                <span className="text-green-500">✓</span>
                              ) : (
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
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#242424] p-4 rounded-lg border border-gray-700">
                        <h3 className="text-sm font-medium text-[#ffcc00] mb-2">
                          How to use
                        </h3>
                        <ol className="text-sm text-gray-400 list-decimal pl-5 space-y-1">
                          <li>Copy the embed code above</li>
                          <li>
                            Paste it into your HTML where you want the agent to
                            appear
                          </li>
                          <li>
                            Adjust width and height as needed for your layout
                          </li>
                          <li>
                            The agent will automatically load with your selected
                            theme
                          </li>
                        </ol>
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
