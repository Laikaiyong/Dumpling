"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiKeysList } from './components/apiKeysList';
import { CreateKeyForm } from './components/createKeyForm';
import { EmbedLinkGenerator } from './components/embedLinkGenerator';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [activeTab, setActiveTab] = useState('api-keys');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch keys
    setTimeout(() => {
      setApiKeys([
        { id: 'key_1', name: 'Production API Key', key: 'dum_prod_kZL6f9xD7ywVtFpR', created: '2025-04-15', lastUsed: '2025-05-06', status: 'active' },
        { id: 'key_2', name: 'Development API Key', key: 'dum_dev_LmN4t8qWsXcVbZpY', created: '2025-04-10', lastUsed: '2025-05-01', status: 'active' },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleCreateKey = (name) => {
    const newKey = {
      id: `key_${apiKeys.length + 1}`,
      name,
      key: `dum_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: '',
      status: 'active'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevokeKey = (keyId) => {
    setApiKeys(apiKeys.map(key => 
      key.id === keyId 
        ? { ...key, status: 'revoked' } 
        : key
    ));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-16">
        <motion.h1 
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-[#ff3131]">API</span> <span className="text-[#ffcc00]">Keys</span> & <span className="text-[#ff3131]">Embed</span> <span className="text-[#ffcc00]">Links</span>
        </motion.h1>
        <p className="text-gray-400 mb-10">Manage your API keys and generate embed links for your AI agents</p>

        <div className="flex mb-6 border-b border-gray-800">
          <button 
            onClick={() => setActiveTab('api-keys')}
            className={`py-3 px-6 font-medium ${activeTab === 'api-keys' 
              ? 'text-[#ffcc00] border-b-2 border-[#ffcc00]' 
              : 'text-gray-400 hover:text-white'}`}
          >
            API Keys
          </button>
          <button 
            onClick={() => setActiveTab('embed-links')}
            className={`py-3 px-6 font-medium ${activeTab === 'embed-links' 
              ? 'text-[#ffcc00] border-b-2 border-[#ffcc00]' 
              : 'text-gray-400 hover:text-white'}`}
          >
            Embed Links
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'api-keys' ? (
            <motion.div
              key="api-keys"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CreateKeyForm onCreateKey={handleCreateKey} />
              <ApiKeysList 
                apiKeys={apiKeys} 
                onRevokeKey={handleRevokeKey} 
                isLoading={isLoading} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="embed-links"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EmbedLinkGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}