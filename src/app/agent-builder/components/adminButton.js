"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

export default function AdminButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { publicKey, connected } = useWallet();
  
  // List of admin wallet addresses (replace with your actual admin addresses)
  const adminWallets = [
    "BWrMFK3zbeKtiYsvTst6kFvm37gY58zZT45LMivsXzSe"
  ];
  
  // Check if the connected wallet is an admin
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      setIsAdmin(adminWallets.includes(walletAddress));
    } else {
      setIsAdmin(false);
    }
  }, [connected, publicKey]);
  
  // If not an admin or wallet not connected, don't render the button
  if (!isAdmin) {
    return null;
  }
  
  // These templates match the ones in the agent-builder page
  const templates = [
    {
      name: 'Token Data Agent',
      description: 'Create an agent that can provide real-time token data via CoinGecko API',
      systemInstructions: 'You are a token price tracking assistant. Provide accurate and timely cryptocurrency data when asked. Always cite your data source and timestamp.',
      type: 'finance',
      capabilities: ['Price Tracking', 'Market Analysis'],
      category: 'finance',
      apiEndpoint: 'https://api.coingecko.com/api/v3'
    },
    {
      name: 'Transaction Insights',
      description: 'Query account transaction data and provide insights through Helius API',
      systemInstructions: 'You are a blockchain transaction analysis expert. Help users understand their transaction history, identify patterns, and provide insights on wallet activity.',
      type: 'analytics',
      capabilities: ['Transaction Analysis', 'Wallet Insights'],
      category: 'analytics',
      apiEndpoint: 'https://api.helius.xyz/v0'
    },
    {
      name: 'Customer Support Bot',
      description: 'Create a support bot with your FAQs and documentation',
      systemInstructions: 'You are a helpful customer support agent. Answer questions based on the provided documentation. If you\'re unsure, inform the user that you\'ll escalate to a human agent.',
      type: 'support',
      capabilities: ['Document Processing', 'Question Answering'],
      category: 'business'
    },
    {
      name: 'NFT Gallery Assistant',
      description: 'Help users browse and interact with NFT collections',
      systemInstructions: 'You are an NFT gallery assistant. Help users discover, browse, and understand NFT collections. Provide details about specific NFTs when requested.',
      type: 'nft',
      capabilities: ['Image Recognition', 'Market Analysis'],
      category: 'nft'
    },
    {
      name: 'Wallet Assistant',
      description: 'Guide users through wallet setup and common operations',
      systemInstructions: 'You are a wallet assistant expert. Help users set up crypto wallets, troubleshoot issues, and understand best security practices.',
      type: 'utilities',
      capabilities: ['Document Processing', 'Text Generation'],
      category: 'utilities'
    },
    {
      name: 'DAO Voting Helper',
      description: 'Assist community members with DAO proposals and voting',
      systemInstructions: 'You are a DAO governance specialist. Guide users through proposals, voting procedures, and provide objective information about governance topics.',
      type: 'governance',
      capabilities: ['Text Generation', 'Document Processing'],
      category: 'governance'
    }
  ];
  
  const populateDatabase = async () => {
    setIsLoading(true);
    setStatus('Creating capability records...');
    
    try {
      // Step 1: Create capabilities first
      const uniqueCapabilities = [...new Set(templates.flatMap(t => t.capabilities))];
      const capabilityMap = {};
      
      for (const capability of uniqueCapabilities) {
        const response = await fetch('/api/capability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: capability,
            description: `${capability} capability`,
            type: 'standard',
            parameters: []
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create capability: ${capability}`);
        }
        
        const data = await response.json();
        capabilityMap[capability] = data.capability._id;
      }
      
      setStatus('Creating agent records...');
      
      // Step 2: Create the agents with capability references
      for (const [index, template] of templates.entries()) {
        setStatus(`Creating agent ${index + 1}/${templates.length}: ${template.name}`);
        
        // Map capability names to IDs
        const capabilityIds = template.capabilities.map(cap => capabilityMap[cap]);
        
        const agentResponse = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: template.name,
            description: template.description,
            systemInstructions: template.systemInstructions,
            type: template.type,
            capabilities: capabilityIds
          })
        });
        
        if (!agentResponse.ok) {
          throw new Error(`Failed to create agent: ${template.name}`);
        }
        
        const agentData = await agentResponse.json();
        
        // Create a simple flow for each agent
        await fetch(`/api/agent/${agentData.agent._id}/flow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${template.name} Flow`,
            flowData: {
              nodes: [
                {
                  id: 'start',
                  data: { label: 'Start' },
                  position: { x: 250, y: 0 },
                  type: 'input',
                },
                {
                  id: 'process',
                  data: { label: 'Process' },
                  position: { x: 250, y: 100 },
                },
                {
                  id: 'end',
                  data: { label: 'Response' },
                  position: { x: 250, y: 200 },
                  type: 'output',
                }
              ],
              edges: [
                { id: 'e1-2', source: 'start', target: 'process' },
                { id: 'e2-3', source: 'process', target: 'end' }
              ]
            }
          })
        });
      }
      
      setStatus('Successfully populated database with templates!');
      setTimeout(() => setStatus(null), 3000);
      
    } catch (error) {
      console.error('Error populating database:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={populateDatabase}
          disabled={isLoading}
          className="bg-[#1a1a1a] border border-gray-700 text-[#ff3131] hover:bg-[#222] hover:border-[#ff3131] px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 relative overflow-hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span>{isLoading ? 'Creating...' : 'Admin: Create Templates'}</span>
          
          {isLoading && (
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#ff3131] to-[#ffcc00]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </button>
        
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 bg-[#1a1a1a] border border-gray-700 text-xs text-gray-300 p-2 rounded-md"
          >
            {status}
          </motion.div>
        )}
      </motion.div>
      
      {/* Link to admin capabilities page */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link href="/capabilities">
          <button className="bg-[#1a1a1a] border border-gray-700 text-[#ffcc00] hover:bg-[#222] hover:border-[#ffcc00] px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Manage Capabilities</span>
          </button>
        </Link>
      </motion.div>
    </div>
  );
}