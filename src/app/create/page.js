"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { useWallet } from "@solana/wallet-adapter-react";

function CreateAgentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const {publicKey} = useWallet();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemInstructions: "",
    type: "General",
    capabilities: [],
    apiEndpoint: "",
  });

  // Knowledge sources state
  const [knowledgeSources, setKnowledgeSources] = useState([
    { type: "file", data: null, status: "pending" }, // Initial empty file source
  ]);

  // API keys state
  const [apiKeys, setApiKeys] = useState([
    { service: "openai", key: "", label: "OpenAI" },
  ]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Template data
  const templates = {
    1: {
      name: "Token Price Bot",
      description: "Get real-time cryptocurrency data",
      systemInstructions:
        "You are a token price tracking assistant. Provide accurate and timely cryptocurrency data when asked. Always cite your data source and timestamp.",
      type: "Finance",
      capabilities: ["Price Tracking", "Market Analysis"],
      apiEndpoint: "https://api.coingecko.com/api/v3",
    },
    2: {
      name: "Transaction Analyzer",
      description: "Query and analyze account transactions",
      systemInstructions:
        "You are a blockchain transaction analysis expert. Help users understand their transaction history, identify patterns, and provide insights on wallet activity.",
      type: "Analytics",
      capabilities: ["Transaction Analysis", "Wallet Insights"],
      apiEndpoint: "https://api.helius.xyz/v0",
    },
    3: {
      name: "Customer Service Bot",
      description: "Support assistant based on your documentation",
      systemInstructions:
        "You are a helpful customer support agent. Answer questions based on the provided documentation. If you're unsure, inform the user that you'll escalate to a human agent.",
      type: "Support",
      capabilities: ["Document Processing", "Question Answering"],
    },
    4: {
      name: "General AI Assistant",
      description: "Text-to-speech capable AI assistant",
      systemInstructions:
        "You are a helpful AI assistant designed to answer questions and assist with a wide range of tasks. Provide concise, accurate information and be courteous.",
      type: "General",
      capabilities: ["Text Generation", "Text-to-Speech"],
    },
  };

  // Load template data on mount
  useEffect(() => {
    if (templateId && templates[templateId]) {
      const template = templates[templateId];
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        systemInstructions: template.systemInstructions,
        type: template.type,
        capabilities: template.capabilities || [],
        apiEndpoint: template.apiEndpoint || "",
      });
    }

    // Fetch available capabilities from the API
    const fetchCapabilities = async () => {
      try {
        const response = await fetch("/api/capability");
        const data = await response.json();
        if (data.capabilities) {
          setAvailableCapabilities(data.capabilities);
        }
      } catch (error) {
        console.error("Failed to fetch capabilities:", error);
      }
    };

    fetchCapabilities();
  }, [templateId]);

  // Knowledge source handlers
  const addKnowledgeSource = (type) => {
    setKnowledgeSources([
      ...knowledgeSources,
      { type, data: null, status: "pending" },
    ]);
  };

  const removeKnowledgeSource = (index) => {
    const updatedSources = [...knowledgeSources];
    updatedSources.splice(index, 1);
    setKnowledgeSources(updatedSources);
  };

  const updateKnowledgeSource = (index, data) => {
    const updatedSources = [...knowledgeSources];
    updatedSources[index] = { ...updatedSources[index], data, status: "ready" };
    setKnowledgeSources(updatedSources);
  };

  // File upload handler
  const handleFileChange = (e, index) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      updateKnowledgeSource(index, files);
      setUploadedFiles([...uploadedFiles, ...files]);

      // Update the status to show files are ready for OCR processing
      const updatedSources = [...knowledgeSources];
      updatedSources[index] = {
        ...updatedSources[index],
        data: files,
        status: "ready",
        message: "Files ready for OCR processing",
      };
      setKnowledgeSources(updatedSources);
    }
  };

  // URL input handler
  const handleUrlInput = (e, index) => {
    const url = e.target.value;
    if (url) {
      updateKnowledgeSource(index, url);
    }
  };

  // Form input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // API key handlers
  const addApiKeyField = () => {
    setApiKeys([...apiKeys, { service: "custom", key: "", label: "" }]);
  };

  const removeApiKeyField = (index) => {
    const updatedKeys = [...apiKeys];
    updatedKeys.splice(index, 1);
    setApiKeys(updatedKeys);
  };

  const updateApiKey = (index, field, value) => {
    const updatedKeys = [...apiKeys];
    updatedKeys[index] = { ...updatedKeys[index], [field]: value };
    setApiKeys(updatedKeys);
  };

  const handleCapabilityToggle = (capability) => {
    const updatedCapabilities = [...formData.capabilities];

    console.log(capability);

    if (updatedCapabilities.includes(capability._id)) {
      const index = updatedCapabilities.indexOf(capability._id);
      updatedCapabilities.splice(index, 1);
    } else {
      updatedCapabilities.push(capability._id);
    }

    setFormData({
      ...formData,
      capabilities: updatedCapabilities,
    });
  };

  // Submit form to API
  // Example for your create agent form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const walletAddress = publicKey?.toString();

      // First create the agent
      const agentPayload = {
        name: formData.name,
        description: formData.description,
        systemInstructions: formData.systemInstructions,
        type: formData.type,
        capabilities: formData.capabilities,
        walletAddress: walletAddress,
      };

      const agentResponse = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentPayload),
      });

      if (!agentResponse.ok) {
        throw new Error("Failed to create agent");
      }

      const agentData = await agentResponse.json();
      const agentId = agentData.agent._id;

      // Now upload and process files for OCR and knowledge embedding
      for (const source of knowledgeSources) {
        if (source.status === "ready" && source.data) {
          // Update upload status
          setUploadProgress(10); // Starting progress

          // Create form data with files
          const formData = new FormData();
          formData.append("agentId", agentId);

          // Add all files to form data
          source.data.forEach((file) => {
            formData.append("files", file);
          });

          // Upload files for OCR processing
          // const response = await fetch("/api/knowledge", {
          //   method: "POST",
          //   body: formData,
          // });

          // if (!response.ok) {
          //   throw new Error(
          //     `Failed to process knowledge source: ${response.statusText}`
          //   );
          // }

          // Show progress during processing
          setUploadProgress(100); // Complete
        }
      }

      // Navigate to the agent page when complete
      router.push(`/agent/${agentId}`);
    } catch (error) {
      console.error("Error creating agent:", error);
      alert("Failed to create agent: " + error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const [availableCapabilities, setAvailableCapabilities] = useState([
    "Text Generation",
    "Image Recognition",
    "Price Tracking",
    "Market Analysis",
    "Transaction Analysis",
    "Wallet Insights",
    "Document Processing",
    "Question Answering",
    "Text-to-Speech",
    "Knowledge Retrieval",
    "Web Search",
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c] relative overflow-hidden">
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-[5%] right-[10%] text-8xl text-[#ff3131]/5 rotate-12"
        animate={{ rotate: [12, -5, 12], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        创
      </motion.div>
      <motion.div
        className="absolute bottom-[10%] left-[5%] text-9xl text-[#ffcc00]/5 -rotate-6"
        animate={{ rotate: [-6, 4, -6], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
        新
      </motion.div>

      {/* Dragon silhouette */}
      <div
        className="absolute right-[-5%] top-[20%] w-[400px] h-[300px] opacity-[0.05]"
        style={{
          backgroundImage:
            "url('https://www.seekpng.com/png/full/16-166429_chinese-dragon-silhouette-chinese-dragon-silhouette-chinese-dragon.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      />

      <Navbar isDashboard={true} />

      <div className="flex min-h-screen pt-16">
        <Sidebar activePage="/create" />

        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 relative">
            <motion.div
              className="absolute left-[-15px] top-0 h-full w-1"
              style={{
                background: "linear-gradient(to bottom, #ff3131, transparent)",
                boxShadow: "0 0 8px rgba(255,49,49,0.5)",
              }}
              animate={{ height: ["0%", "100%"] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] to-[#ffcc00]">
              Create New AI Agent
            </h1>

            <p className="text-gray-400">
              {templateId
                ? "Customize your template bot"
                : "Configure your AI agent's capabilities and settings"}
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

          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8 relative">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= stepNum
                      ? "bg-gradient-to-r from-[#ff3131] to-[#ffcc00] text-black"
                      : "bg-[#1a1a1a] text-gray-500 border border-gray-800"
                  }`}
                  animate={step === stepNum ? { scale: [1, 1.1, 1] } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: step === stepNum ? Infinity : 0,
                    repeatDelay: 2,
                  }}>
                  {stepNum}
                </motion.div>
                <span className="mt-2 text-sm text-gray-400">
                  {stepNum === 1
                    ? "Basic Info"
                    : stepNum === 2
                    ? "Capabilities"
                    : "Knowledge & API Keys"}
                </span>
              </div>
            ))}

            {/* Connection line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>
            <motion.div
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] -z-5"
              style={{ width: `${(step - 1) * 50}%` }}
              initial={{ width: "0%" }}
              animate={{ width: `${(step - 1) * 50}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 shadow-lg shadow-[#ff3131]/5">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Agent Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                      placeholder="Give your AI agent a name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131] min-h-[80px]"
                      placeholder="What does your agent do?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      System Instructions
                    </label>
                    <textarea
                      name="systemInstructions"
                      value={formData.systemInstructions}
                      onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131] min-h-[120px]"
                      placeholder="Instructions that define your agent's behavior and knowledge (e.g. 'You are a helpful assistant who specializes in...')"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      System instructions help shape the behavior and knowledge
                      of your AI agent.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      Agent Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]">
                      <option value="General">General</option>
                      <option value="Finance">Finance</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Support">Support</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Capabilities */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-4">
                      Select Capabilities
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableCapabilities.map((capability) => (
                        <motion.div
                          key={capability.name}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCapabilityToggle(capability)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.capabilities.includes(capability)
                              ? "bg-gradient-to-br from-[#ff3131]/20 to-[#ffcc00]/20 border-[#ff3131]/50"
                              : "bg-[#0f0f0f] border-gray-800 hover:border-gray-700"
                          }`}>
                          <div className="flex items-center">
                            <div
                              className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                                formData.capabilities.includes(capability)
                                  ? "bg-[#ff3131]"
                                  : "border border-gray-600"
                              }`}>
                              {formData.capabilities.includes(capability._id) && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-white"
                                  viewBox="0 0 20 20"
                                  fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span>{capability.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-8 border-t border-gray-800 pt-6">
                      <h3 className="text-lg text-[#ffcc00] mb-3">
                        Coming Soon Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            name: "Smart Trading",
                            description:
                              "Automated trading strategies and market insights",
                          },
                          {
                            name: "Polymarket Integration",
                            description:
                              "Prediction market data and forecasting",
                          },
                          {
                            name: "Multi-chain Analysis",
                            description: "Cross-chain transaction monitoring",
                          },
                          {
                            name: "Staking Master",
                            description: "Search the best Yield",
                          },
                          {
                            name: "Advanced RAG",
                            description:
                              "Enhanced retrieval augmented generation",
                          },
                        ].map((feature, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border border-gray-800 bg-[#0f0f0f] opacity-60 cursor-not-allowed relative overflow-hidden">
                            <div className="absolute top-2 right-2 bg-[#ff3131]/80 text-xs text-white px-2 py-1 rounded-md rotate-3">
                              Coming Soon
                            </div>
                            <h4 className="font-medium text-gray-400">
                              {feature.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {feature.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Knowledge & API Keys */}
              {step === 3 && (
                <div className="space-y-8">
                  {/* Knowledge Base Section */}
                  <div>
                    <h3 className="text-xl text-[#ffcc00] mb-2">
                      Knowledge Base
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Add knowledge sources for your agent. Files will be
                      processed, vectorized and stored for retrieval.
                    </p>

                    <div className="space-y-4">
                      {knowledgeSources.map((source, index) => (
                        <div
                          key={index}
                          className="border border-gray-800 rounded-lg p-4 bg-[#0f0f0f]">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-300">
                                Source #{index + 1}
                              </span>
                              {source.status === "ready" && (
                                <span className="ml-2 px-2 py-0.5 bg-green-900/30 text-green-500 text-xs rounded-full">
                                  Ready
                                </span>
                              )}
                            </div>

                            {/* Remove button (don't show for first source) */}
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => removeKnowledgeSource(index)}
                                className="text-gray-500 hover:text-[#ff3131]">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Source Type Selection */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <button
                              type="button"
                              className={`py-2 px-3 text-center text-sm rounded-md ${
                                source.type === "file"
                                  ? "bg-[#ff3131]/20 text-[#ff3131] border border-[#ff3131]/30"
                                  : "bg-[#1a1a1a] text-gray-400 border border-gray-800"
                              }`}
                              onClick={() => {
                                const updatedSources = [...knowledgeSources];
                                updatedSources[index] = {
                                  ...updatedSources[index],
                                  type: "file",
                                  data: null,
                                  status: "pending",
                                };
                                setKnowledgeSources(updatedSources);
                              }}>
                              Upload Files
                            </button>
                            <button
                              type="button"
                              className={`py-2 px-3 text-center text-sm rounded-md 
                                bg-[#1a1a1a] text-gray-500 border border-gray-800 
                                opacity-70 cursor-not-allowed relative`}
                              disabled={true}>
                              Web URL
                              <span className="absolute -top-2 -right-2 bg-[#ff3131]/80 text-xs text-white px-1.5 py-0.5 rounded-md text-[10px] rotate-3">
                                Soon
                              </span>
                            </button>
                            <button
                              type="button"
                              className={`py-2 px-3 text-center text-sm rounded-md 
                                bg-[#1a1a1a] text-gray-500 border border-gray-800 
                                opacity-70 cursor-not-allowed relative`}
                              disabled={true}>
                              Notion
                              <span className="absolute -top-2 -right-2 bg-[#ff3131]/80 text-xs text-white px-1.5 py-0.5 rounded-md text-[10px] rotate-3">
                                Soon
                              </span>
                            </button>
                          </div>

                          {/* Input field based on selected type */}
                          {source.type === "file" && (
                            <div className="border border-dashed border-gray-700 rounded-lg p-6 text-center">
                              <input
                                type="file"
                                onChange={(e) => handleFileChange(e, index)}
                                className="hidden"
                                id={`file-upload-${index}`}
                                multiple
                                accept=".pdf,.doc,.docx,.txt,.html,.md,.csv,.json"
                              />
                              <label
                                htmlFor={`file-upload-${index}`}
                                className="cursor-pointer">
                                <div className="flex flex-col items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-gray-500 mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"
                                    />
                                  </svg>
                                  <p className="text-gray-400 mb-1">
                                    {source.data
                                      ? `${source.data.length} files selected`
                                      : "Drop files here or click to browse"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PDF, DOC, TXT, HTML, MD, CSV, JSON (max
                                    50MB)
                                  </p>
                                </div>
                              </label>

                              {source.data && source.data.length > 0 && (
                                <div className="mt-3 text-left">
                                  <ul className="max-h-24 overflow-y-auto">
                                    {source.data.map((file, fileIndex) => (
                                      <li
                                        key={fileIndex}
                                        className="text-xs text-gray-400 flex items-center space-x-1">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3 w-3 text-green-500"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                        <span>
                                          {file.name} (
                                          {Math.round(file.size / 1024)} KB)
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {source.type === "url" && (
                            <div className="space-y-2">
                              <input
                                type="url"
                                placeholder="Enter website URL (e.g. https://example.com/docs)"
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                                onChange={(e) => handleUrlInput(e, index)}
                              />
                              <p className="text-xs text-gray-500">
                                The URL will be crawled and its content will be
                                processed for your agent.
                              </p>
                            </div>
                          )}

                          {source.type === "notion" && (
                            <div className="space-y-2">
                              <input
                                type="url"
                                placeholder="Enter Notion page URL"
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                                onChange={(e) => handleUrlInput(e, index)}
                              />
                              <p className="text-xs text-gray-500">
                                Your agent will be able to access and search
                                content from this Notion page.
                              </p>
                              <div className="bg-yellow-900/20 border border-yellow-800/20 rounded-md p-3 mt-2">
                                <p className="text-xs text-yellow-500">
                                  <span className="font-semibold">Note:</span>{" "}
                                  Make sure your Notion page is publicly
                                  accessible or you&apos;ve shared it with our
                                  integration.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add source button */}
                      <button
                        type="button"
                        onClick={() => addKnowledgeSource("file")}
                        className="w-full py-3 bg-[#0f0f0f] border border-dashed border-gray-700 rounded-lg text-gray-400 hover:bg-[#1a1a1a] hover:border-gray-600 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Knowledge Source
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-[#0f0f0f] border border-gray-800 rounded-md hover:bg-[#1a1a1a] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    Previous
                  </motion.button>
                ) : (
                  <Link href="/dashboard">
                    <motion.button
                      type="button"
                      className="px-6 py-3 bg-[#0f0f0f] border border-gray-800 rounded-md hover:bg-[#1a1a1a] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      Cancel
                    </motion.button>
                  </Link>
                )}

                {step < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-medium rounded-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-medium rounded-md relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                        {uploadProgress > 0
                          ? `Creating... ${uploadProgress}%`
                          : "Creating..."}
                      </span>
                    ) : (
                      <span>Create Agent</span>
                    )}

                    {/* Create button shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ x: "-100%", opacity: 0.3 }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CreateAgent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateAgentForm />
    </Suspense>
  );
}
