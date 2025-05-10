"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

function CreateAgentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "General",
    capabilities: [],
    apiEndpoint: "",
    apiKey: "",
    documentation: null
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Template data
  const templates = {
    "1": {
      name: "Token Price Bot",
      description: "Get real-time cryptocurrency data",
      type: "Finance",
      capabilities: ["Price Tracking", "Market Analysis"],
      apiEndpoint: "https://api.coingecko.com/api/v3",
    },
    "2": {
      name: "Transaction Analyzer",
      description: "Query and analyze account transactions",
      type: "Analytics",
      capabilities: ["Transaction Analysis", "Wallet Insights"],
      apiEndpoint: "https://api.helius.xyz/v0",
    },
    "3": {
      name: "Customer Service Bot",
      description: "Support assistant based on your documentation",
      type: "Support",
      capabilities: ["Document Processing", "Question Answering"],
    },
    "4": {
      name: "General AI Assistant",
      description: "Text-to-speech capable AI assistant",
      type: "General",
      capabilities: ["Text Generation", "Text-to-Speech"],
    }
  };
  
  useEffect(() => {
    if (templateId && templates[templateId]) {
      const template = templates[templateId];
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        type: template.type,
        capabilities: template.capabilities || [],
        apiEndpoint: template.apiEndpoint || "",
      });
    }
  }, [templateId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      documentation: e.target.files[0],
    });
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    router.push("/dashboard");
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
      
      <Navbar />
      
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
                  {stepNum === 1 ? "Basic Info" : stepNum === 2 ? "Capabilities" : "Configuration"}
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
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131] min-h-[120px]"
                      placeholder="What does your agent do?"
                      required
                    />
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
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-6">
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
                      <label className="block text-gray-300 mb-2">Upload Documentation</label>
                      <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" />
                            </svg>
                            <p className="text-gray-400 mb-1">Drag & drop files here or click to browse</p>
                            <p className="text-xs text-gray-500">PDF, TXT, DOCX, or MD (max 50MB)</p>
                          </div>
                        </label>
                        {formData.documentation && (
                          <p className="mt-4 text-sm text-green-500">
                            File selected: {formData.documentation.name}
                          </p>
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
                        Creating...
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