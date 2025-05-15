"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';

export default function AdminCapabilities() {
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'standard',
    apiEndpoint: '',
    parameters: []
  });
  const [currentParameter, setCurrentParameter] = useState({ name: '', type: 'string' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  
  // List of admin wallet addresses
  const adminWallets = [
    "BWrMFK3zbeKtiYsvTst6kFvm37gY58zZT45LMivsXzSe"
  ];
  
  // Check if the connected wallet is an admin, if not, redirect to dashboard
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      if (!adminWallets.includes(walletAddress)) {
        router.push('/dashboard');
      }
    } else if (typeof window !== 'undefined') {
      // Only redirect on client side to avoid hydration issues
      router.push('/dashboard');
    }
  }, [connected, publicKey, router]);
  
  // Fetch capabilities when component mounts
  useEffect(() => {
    fetchCapabilities();
  }, []);
  
  // Fetch capabilities from API
  const fetchCapabilities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/capability');
      const data = await response.json();
      if (data.capabilities) {
        setCapabilities(data.capabilities);
      }
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      setError('Failed to load capabilities');
    } finally {
      setLoading(false);
    }
  };
  
  // Search capabilities using vector similarity with HuggingFaceJS embeddings
  const searchCapabilities = async () => {
    if (!searchQuery.trim()) {
      fetchCapabilities();
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/capability?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.capabilities) {
        setCapabilities(data.capabilities);
      }
    } catch (error) {
      console.error('Error searching capabilities:', error);
      setError('Failed to search capabilities');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle parameter input changes
  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setCurrentParameter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add parameter to the list
  const addParameter = () => {
    if (currentParameter.name.trim()) {
      setFormData(prev => ({
        ...prev,
        parameters: [...prev.parameters, { ...currentParameter }]
      }));
      setCurrentParameter({ name: '', type: 'string' });
    }
  };
  
  // Remove parameter from the list
  const removeParameter = (index) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission to create a new capability with vector embedding
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/capability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create capability');
      }
      
      setSuccess('Capability created successfully with rubert-tiny2 vector embedding!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'standard',
        apiEndpoint: '',
        parameters: []
      });
      // Refresh capabilities list
      fetchCapabilities();
      
    } catch (error) {
      console.error('Error creating capability:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete capability
  const deleteCapability = async (id) => {
    if (!confirm('Are you sure you want to delete this capability?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/capability/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete capability');
      }
      
      fetchCapabilities();
      setSuccess('Capability deleted successfully');
      
    } catch (error) {
      console.error('Error deleting capability:', error);
      setError(error.message);
    }
  };
  
  // If wallet is not connected or not an admin, show loading or redirect
  if (!connected || (connected && publicKey && !adminWallets.includes(publicKey.toString()))) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c] flex items-center justify-center">
        <Navbar isDashboard={true}  />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white"
        >
          Redirecting...
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c]">
      <Navbar isDashboard={true} />
      
      <div className="flex min-h-screen pt-16">
        <Sidebar activePage="/capabilities" />
        
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
              Admin: Manage Capabilities
            </h1>
            
            <p className="text-gray-400">
              Create, search and manage agent capabilities with vector embeddings using rubert-tiny2 model
            </p>
          </motion.div>
          
          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-900/30 border border-green-700 text-green-400 rounded"
            >
              {success}
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-400 rounded"
            >
              {error}
            </motion.div>
          )}
          
          {/* Create New Capability Form */}
          <div className="mb-8 bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl text-[#ffcc00] mb-4">Create New Capability</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                  >
                    <option value="standard">Standard</option>
                    <option value="api">API</option>
                    <option value="data">Data Processing</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff3131] min-h-[100px]"
                  placeholder="Detailed description of this capability (will be embedded as vectors using rubert-tiny2)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This description will be embedded as a vector using the HuggingFaceJS with rubert-tiny2 model for semantic search.
                </p>
              </div>
              
              {formData.type === 'api' && (
                <div>
                  <label className="block text-gray-300 mb-1">API Endpoint</label>
                  <input
                    type="text"
                    name="apiEndpoint"
                    value={formData.apiEndpoint}
                    onChange={handleChange}
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-300 mb-2">Parameters</label>
                
                <div className="mb-2 grid grid-cols-1 lg:grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="block text-xs text-gray-400">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={currentParameter.name}
                      onChange={handleParameterChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff3131] text-sm"
                      placeholder="Parameter name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400">Type</label>
                    <select
                      name="type"
                      value={currentParameter.type}
                      onChange={handleParameterChange}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#ff3131] text-sm"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addParameter}
                    className="bg-[#0f0f0f] border border-gray-700 hover:border-[#ff3131] text-gray-300 px-4 py-2 rounded-md flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add
                  </button>
                </div>
                
                {formData.parameters.length > 0 && (
                  <div className="mt-3 border border-gray-800 rounded-md p-3 bg-[#0f0f0f]">
                    <div className="text-xs text-gray-500 mb-2">Added Parameters:</div>
                    <ul className="space-y-2">
                      {formData.parameters.map((param, index) => (
                        <li key={index} className="flex justify-between items-center text-sm">
                          <span>
                            <span className="text-[#ff3131]">{param.name}</span>
                            <span className="text-gray-500 ml-2">({param.type})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeParameter(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-medium rounded-md relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span>Create Capability</span>
                  )}
                  
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: "-100%", opacity: 0.3 }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                </motion.button>
              </div>
            </form>
          </div>
          
          {/* Vector Search Box */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search capabilities by semantic meaning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 bg-[#1a1a1a] border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3131] shadow-inner shadow-black/30"
              />
              <button 
                onClick={searchCapabilities}
                disabled={isSearching}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center bg-[#ff3131]/20 hover:bg-[#ff3131]/30 text-[#ff3131] h-8 w-8 rounded-full"
              >
                {isSearching ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-xs text-gray-500 mt-1 ml-2">
                Powered by vector search using HuggingFaceJS with the rubert-tiny2 model
              </p>
            </div>
          </div>
          
          {/* Capabilities List */}
          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl text-[#ffcc00]">All Capabilities</h2>
              <span className="text-sm text-gray-400">{capabilities.length} capabilities</span>
            </div>
            
            {loading ? (
              <div className="p-8 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-[#ff3131]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : capabilities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No capabilities found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0f0f0f]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {capabilities.map((capability) => (
                      <motion.tr 
                        key={capability._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{capability.name}</div>
                          {capability.score && (
                            <div className="text-xs text-gray-500">Match: {Math.round(capability.score * 100)}%</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#ff3131]/10 text-[#ff3131]">
                            {capability.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 truncate max-w-xs">
                            {capability.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(capability.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => deleteCapability(capability._id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}