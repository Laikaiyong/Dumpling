import { useState } from "react";

export default function ApiKeyManager({ agent, id, publicKey, agentApiKeys, setAgentApiKeys }) {
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [savingApiKey, setSavingApiKey] = useState(false);
    const [generatingApiKey, setGeneratingApiKey] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');
    
    // Generate a random API key
    const generateApiKey = () => {
      setGeneratingApiKey(true);
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      setNewApiKey(result);
      setGeneratingApiKey(false);
    };
  
    // Handle adding API key
    const handleAddApiKey = async (e) => {
      e.preventDefault();
      setSavingApiKey(true);
      
      // Get the connected wallet address
      const walletAddress = publicKey?.toString();
      
      if (!walletAddress) {
        alert("Please connect your wallet to add API keys");
        setSavingApiKey(false);
        return;
      }
      
      const formData = new FormData(e.target);
      const service = formData.get("service");
      const apiKey = formData.get("apiKey") || newApiKey;
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
        const response = await fetch(`/api/api-key`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: serviceName,
            apiKey,
            walletAddress
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save API key");
        }
        
        // Add new key to state
        setAgentApiKeys({
          ...agentApiKeys,
          [serviceName]: "••••••••••••", // Hide actual key in UI
        });
        
        setShowApiKeyModal(false);
        setNewApiKey('');
        
      } catch (error) {
        console.error("Error saving API key:", error);
        alert("Failed to save API key. Please try again.");
      } finally {
        setSavingApiKey(false);
      }
    };
    
    // Handle deleting API key
    const handleDeleteApiKey = async (service) => {
      if (!confirm(`Are you sure you want to delete the API key for ${service}?`)) {
        return;
      }
      
      // Get the connected wallet address
      const walletAddress = publicKey?.toString();
      
      if (!walletAddress) {
        alert("Please connect your wallet to delete API keys");
        return;
      }
      
      try {
        const response = await fetch(`/api/agent/${id}/keys`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ service, walletAddress }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete API key");
        }
        
        // Remove key from state
        const updatedKeys = { ...agentApiKeys };
        delete updatedKeys[service];
        setAgentApiKeys(updatedKeys);
        
      } catch (error) {
        console.error("Error deleting API key:", error);
        alert("Failed to delete API key. Please try again.");
      }
    };
    
    // Check if user is owner of this bot
    const isOwner = agent?.ownerAddress && publicKey && agent.ownerAddress === publicKey.toString();
    
    // Return null if user is not the owner
    if (!isOwner) {
      return (
        <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-md p-4 mt-4">
          <p className="text-yellow-500">
            You are not the owner of this bot. Only the wallet owner can manage API keys.

            API Key is not available for Public Bot.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-[#ffcc00] mb-3 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
            />
          </svg>
          API Keys
        </h3>
        
        <p className="text-sm text-gray-400 mb-4">
          Create API keys to allow external applications to access this bot. Never share these keys publicly.
        </p>
        
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-md p-4">
          {Object.keys(agentApiKeys || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(agentApiKeys || {}).map(([service, _]) => (
                <div key={service} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-300 capitalize">{service}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">••••••••••••</span>
                    <button
                      onClick={() => handleDeleteApiKey(service)}
                      className="text-gray-400 hover:text-[#ff3131]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              No API keys configured for this bot. Create one to enable API access.
            </p>
          )}
          
          <button
            onClick={() => {
              setShowApiKeyModal(true);
              setNewApiKey('');
            }}
            className="mt-4 px-4 py-2 bg-[#1a1a1a] border border-gray-700 hover:border-[#ff3131] rounded-md text-sm text-gray-300 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add API Key
          </button>
        </div>
        
        {/* API usage instructions */}
        <div className="mt-4 p-4 bg-[#1a1a1a] border border-gray-800 rounded-md">
          <h4 className="font-medium text-[#ffcc00] mb-2">API Usage</h4>
          <p className="text-sm text-gray-400 mb-2">
            Use the following endpoint to interact with your bot via API:
          </p>
          <div className="bg-[#0a0a0a] p-3 rounded-md font-mono text-sm text-gray-300 overflow-x-auto">
            POST {process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"}/api/agent/{id}/api
          </div>
          
          <h5 className="font-medium text-gray-300 mt-4 mb-1">Request Body:</h5>
          <div className="bg-[#0a0a0a] p-3 rounded-md font-mono text-sm text-gray-300 overflow-x-auto">
  {`{
    "message": "Your message to the bot",
    "apiKey": "your-api-key"
  }`}
          </div>
        </div>
        
        {/* API Key Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 w-full max-w-md">
              <h3 className="text-xl font-medium text-[#ffcc00] mb-4">Add API Key</h3>
              
              <form onSubmit={handleAddApiKey}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Service Name</label>
                  <select
                    name="service"
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                    defaultValue="client"
                    onChange={(e) => {
                      const customField = document.querySelector('.custom-service-field');
                      if (customField) {
                        customField.style.display = e.target.value === 'custom' ? 'block' : 'none';
                      }
                    }}
                  >
                    <option value="client">Client Application</option>
                    <option value="web">Web Integration</option>
                    <option value="mobile">Mobile App</option>
                    <option value="discord">Discord Bot</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                {/* Custom service name field */}
                <div className="mb-4 custom-service-field" style={{ display: 'none' }}>
                  <label className="block text-gray-300 mb-2">Custom Service Name</label>
                  <input
                    type="text"
                    name="customService"
                    placeholder="Enter service name"
                    className="w-full bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">API Key</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="apiKey"
                      value={newApiKey}
                      onChange={e => setNewApiKey(e.target.value)}
                      placeholder="Generate or enter custom API key"
                      className="flex-1 bg-[#0f0f0f] border border-gray-800 rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                    />
                    <button
                      type="button"
                      onClick={generateApiKey}
                      className="px-3 py-1 bg-[#0f0f0f] border border-gray-700 hover:border-gray-600 rounded-md text-gray-400 flex items-center"
                      disabled={generatingApiKey}
                    >
                      {generatingApiKey ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <span>Generate</span>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 bg-[#0f0f0f] border border-gray-800 rounded-md text-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] text-black font-medium rounded-md"
                    disabled={savingApiKey}
                  >
                    {savingApiKey ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span>Save Key</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };