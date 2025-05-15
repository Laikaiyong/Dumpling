"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Panel 
} from 'reactflow';
import 'reactflow/dist/style.css';

// Initial nodes for flow diagram
const initialNodes = [
  {
    id: 'start',
    data: { label: 'Start' },
    position: { x: 250, y: 0 },
    type: 'input',
    style: { background: '#ff3131', color: 'white', border: 'none', borderRadius: '8px' }
  },
  {
    id: 'process',
    data: { label: 'Process Input' },
    position: { x: 250, y: 100 },
    style: { background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px' }
  },
  {
    id: 'end',
    data: { label: 'Output Response' },
    position: { x: 250, y: 200 },
    type: 'output',
    style: { background: '#ffcc00', color: 'black', border: 'none', borderRadius: '8px' }
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'start', target: 'process', animated: true, style: { stroke: '#ff3131' } },
  { id: 'e2-3', source: 'process', target: 'end', animated: true, style: { stroke: '#ffcc00' } },
];

function CreateAgentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemInstructions: "", // Added system instructions field
    type: "General",
    capabilities: [],
    apiEndpoint: "",
    apiKey: "",
    documentation: null
  });
  
  // Flow diagram state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [availableCapabilities, setAvailableCapabilities] = useState([]);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Template data
  const templates = {
    "1": {
      name: "Token Price Bot",
      description: "Get real-time cryptocurrency data",
      systemInstructions: "You are a token price tracking assistant. Provide accurate and timely cryptocurrency data when asked. Always cite your data source and timestamp.",
      type: "Finance",
      capabilities: ["Price Tracking", "Market Analysis"],
      apiEndpoint: "https://api.coingecko.com/api/v3",
    },
    "2": {
      name: "Transaction Analyzer",
      description: "Query and analyze account transactions",
      systemInstructions: "You are a blockchain transaction analysis expert. Help users understand their transaction history, identify patterns, and provide insights on wallet activity.",
      type: "Analytics",
      capabilities: ["Transaction Analysis", "Wallet Insights"],
      apiEndpoint: "https://api.helius.xyz/v0",
    },
    "3": {
      name: "Customer Service Bot",
      description: "Support assistant based on your documentation",
      systemInstructions: "You are a helpful customer support agent. Answer questions based on the provided documentation. If you're unsure, inform the user that you'll escalate to a human agent.",
      type: "Support",
      capabilities: ["Document Processing", "Question Answering"],
    },
    "4": {
      name: "General AI Assistant",
      description: "Text-to-speech capable AI assistant",
      systemInstructions: "You are a helpful AI assistant designed to answer questions and assist with a wide range of tasks. Provide concise, accurate information and be courteous.",
      type: "General",
      capabilities: ["Text Generation", "Text-to-Speech"],
    }
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
        const response = await fetch('/api/capabilities');
        const data = await response.json();
        if (data.capabilities) {
          setAvailableCapabilities(data.capabilities);
        }
      } catch (error) {
        console.error('Failed to fetch capabilities:', error);
      }
    };
    
    fetchCapabilities();
  }, [templateId]);
  
  // Form input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };
  
  const handleCapabilityToggle = (capability) => {
    const updatedCapabilities = [...formData.capabilities];
    
    if (updatedCapabilities.includes(capability)) {
      const index = updatedCapabilities.indexOf(capability);
      updatedCapabilities.splice(index, 1);
    } else {
      updatedCapabilities.push(capability);
    }
    
    setFormData({
      ...formData,
      capabilities: updatedCapabilities,
    });
  };
  
  // Flow diagram handlers
  const onConnect = useCallback((params) => {
    setEdges((edges) => addEdge({ ...params, animated: true }, edges));
  }, [setEdges]);
  
  const handleAddNode = () => {
    const newNodeId = `node-${nodes.length + 1}`;
    const newNode = {
      id: newNodeId,
      data: { label: `Process Step ${nodes.length - 1}` },
      position: { x: 250, y: (nodes.length * 100) },
      style: { background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px' }
    };
    setNodes((nds) => [...nds, newNode]);
  };
  
  // Submit form to API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Create the agent first
      const agentResponse = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          systemInstructions: formData.systemInstructions,
          type: formData.type,
          capabilities: formData.capabilities,
        }),
      });
      
      const agentData = await agentResponse.json();
      
      if (!agentResponse.ok) {
        throw new Error(agentData.error || 'Failed to create agent');
      }
      
      const agentId = agentData.agent._id;
      
      // 2. Save the flow diagram if it exists
      await fetch(`/api/agent/${agentId}/flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.name} Flow`,
          flowData: {
            nodes,
            edges,
          },
        }),
      });
      
      // 3. Upload any documentation
      if (uploadedFiles.length > 0) {
        const totalFiles = uploadedFiles.length;
        let filesProcessed = 0;
        
        for (const file of uploadedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          
          await fetch(`/api/agent/${agentId}/knowledge`, {
            method: 'POST',
            body: formData,
          });
          
          filesProcessed++;
          setUploadProgress(Math.round((filesProcessed / totalFiles) * 100));
        }
      }
      
      setLoading(false);
      router.push(`/agent/${agentId}`);
      
    } catch (error) {
      console.error('Error creating agent:', error);
      setLoading(false);
      alert('Error creating agent: ' + error.message);
    }
  };
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const allCapabilities = [
    "Text Generation",
    "Image Recognition",
    "Price Tracking",
    "Market Analysis",
    "Transaction Analysis",
    "Wallet Insights",
    "Document Processing",
    "Question Answering",
    "Text-to-Speech",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c] relative overflow-hidden">
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-[5%] right-[10%] text-8xl text-[#ff3131]/5 rotate-12"
        animate={{ rotate: [12, -5, 12], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        创
      </motion.div>
      <motion.div
        className="absolute bottom-[10%] left-[5%] text-9xl text-[#ffcc00]/5 -rotate-6"
        animate={{ rotate: [-6, 4, -6], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        新
      </motion.div>
      
      {/* Dragon silhouette */}
      <div className="absolute right-[-5%] top-[20%] w-[400px] h-[300px] opacity-[0.05]" style={{
        backgroundImage: "url('https://www.seekpng.com/png/full/16-166429_chinese-dragon-silhouette-chinese-dragon-silhouette-chinese-dragon.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat"
      }} />
      
      <Navbar isDashboard={true} />
      
      <div className="flex min-h-screen pt-16">
        <Sidebar activePage="/create" />
        
        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 relative"
          >
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
              {templateId ? "Customize your template bot" : "Configure your AI agent's capabilities and settings"}
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
                <linearGradient id="redGoldGradient" x1="0" y1="0" x2="1" y2="0">
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
                  transition={{ duration: 0.5, repeat: step === stepNum ? Infinity : 0, repeatDelay: 2 }}
                >
                  {stepNum}
                </motion.div>
                <span className="mt-2 text-sm text-gray-400">
                  {stepNum === 1 ? "Basic Info" : stepNum === 2 ? "Capabilities" : "Advanced Config"}
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
            className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 shadow-lg shadow-[#ff3131]/5"
          >
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Agent Name</label>
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
                    <label className="block text-gray-300 mb-2">Description</label>
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
                    <label className="block text-gray-300 mb-2">System Instructions</label>
                    <textarea
                      name="systemInstructions"
                      value={formData.systemInstructions}
                      onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131] min-h-[120px]"
                      placeholder="Instructions that define your agent's behavior and knowledge (e.g. 'You are a helpful assistant who specializes in...')"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      System instructions help shape the behavior and knowledge of your AI agent.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Agent Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                    >
                      <option value="General">General</option>
                      <option value="Finance">Finance</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Support">Support</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-4">Select Capabilities</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allCapabilities.map((capability) => (
                        <motion.div
                          key={capability}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCapabilityToggle(capability)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.capabilities.includes(capability)
                              ? "bg-gradient-to-br from-[#ff3131]/20 to-[#ffcc00]/20 border-[#ff3131]/50"
                              : "bg-[#0f0f0f] border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                              formData.capabilities.includes(capability)
                                ? "bg-[#ff3131]"
                                : "border border-gray-600"
                            }`}>
                              {formData.capabilities.includes(capability) && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span>{capability}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-800 pt-6">
                    <button 
                      type="button"
                      onClick={() => {
                        const name = prompt("Enter a new capability name:");
                        if (name && name.trim() !== "") {
                          handleCapabilityToggle(name.trim());
                        }
                      }}
                      className="bg-[#0f0f0f] border border-gray-700 hover:border-[#ff3131] text-gray-300 px-4 py-2 rounded-md flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Custom Capability
                    </button>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl text-[#ffcc00] mb-2">Flow Diagram</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Configure how your agent processes information by arranging the flow below.
                      You can add nodes, connect them, and customize the logic.
                    </p>
                    
                    <div className="h-80 border border-gray-800 rounded-lg bg-[#0f0f0f] overflow-hidden">
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                      >
                        <Controls className="bg-[#1a1a1a] border border-gray-800 rounded-md" />
                        <Background color="#333" gap={16} />
                        <Panel position="top-right">
                          <button
                            onClick={handleAddNode}
                            className="bg-[#1a1a1a] border border-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            + Add Node
                          </button>
                        </Panel>
                      </ReactFlow>
                    </div>
                  </div>
                  
                  {(formData.type === "Finance" || formData.type === "Analytics") && (
                    <div>
                      <label className="block text-gray-300 mb-2">API Endpoint</label>
                      <input
                        type="text"
                        name="apiEndpoint"
                        value={formData.apiEndpoint}
                        onChange={handleChange}
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                        placeholder="https://api.example.com"
                      />
                    </div>
                  )}
                  
                  {(formData.capabilities.includes("Transaction Analysis") || 
                    formData.capabilities.includes("Price Tracking")) && (
                    <div>
                      <label className="block text-gray-300 mb-2">API Key</label>
                      <input
                        type="password"
                        name="apiKey"
                        value={formData.apiKey}
                        onChange={handleChange}
                        className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                        placeholder="Your API Key"
                      />
                    </div>
                  )}
                  
                  {formData.capabilities.includes("Document Processing") && (
                    <div>
                      <label className="block text-gray-300 mb-2">Upload Knowledge Base Documents</label>
                      <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          multiple
                          accept=".pdf,.doc,.docx,.html,.svg,.txt,.md"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" />
                            </svg>
                            <p className="text-gray-400 mb-1">Drag & drop files here or click to browse</p>
                            <p className="text-xs text-gray-500">PDF, DOC, HTML, SVG, TXT, or MD (max 50MB)</p>
                          </div>
                        </label>
                        
                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 text-left">
                            <h4 className="text-sm font-medium text-gray-300 mb-2">
                              {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} selected:
                            </h4>
                            <ul className="space-y-1 max-h-32 overflow-y-auto">
                              {uploadedFiles.map((file, i) => (
                                <li key={i} className="text-xs text-gray-400 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {file.name} ({Math.round(file.size / 1024)} KB)
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {formData.capabilities.includes("Text-to-Speech") && (
                    <div className="bg-[#0f0f0f] p-4 rounded-lg border border-gray-800">
                      <h3 className="text-[#ffcc00] mb-2">Text-to-Speech Integration</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        This agent will use ElevenLabs API for text-to-speech capabilities.
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enable-tts"
                          className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-[#ff3131] focus:ring-0"
                          defaultChecked={true}
                        />
                        <label htmlFor="enable-tts" className="text-gray-300">Enable Text-to-Speech</label>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-[#0f0f0f] border border-gray-800 rounded-md hover:bg-[#1a1a1a] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Previous
                  </motion.button>
                ) : (
                  <Link href="/dashboard">
                    <motion.button
                      type="button"
                      className="px-6 py-3 bg-[#0f0f0f] border border-gray-800 rounded-md hover:bg-[#1a1a1a] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
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
                    whileTap={{ scale: 0.98 }}
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-medium rounded-md relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {uploadProgress > 0 ? `Creating... ${uploadProgress}%` : 'Creating...'}
                      </span>
                    ) : (
                      <span>Create Agent</span>
                    )}
                    
                    {/* Create button shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ x: "-100%", opacity: 0.3 }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
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