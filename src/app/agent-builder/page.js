"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TemplateGallery } from './components/templateGallery';
import Link from 'next/link';

export default function AgentBuilder() {
  const [searchQuery, setSearchQuery] = useState('');

  const templates = [
    {
      id: 'token-data',
      name: 'Token Data Agent',
      description: 'Create an agent that can provide real-time token data via CoinGecko API',
      icon: '📈',
      category: 'finance',
      popular: true
    },
    {
      id: 'transaction-insights',
      name: 'Transaction Insights',
      description: 'Query account transaction data and provide insights through Helius API',
      icon: '🔍',
      category: 'analytics',
      popular: true
    },
    {
      id: 'customer-support',
      name: 'Customer Support Bot',
      description: 'Create a support bot with your FAQs and documentation',
      icon: '🤝',
      category: 'business',
      popular: true
    },
    {
      id: 'nft-gallery',
      name: 'NFT Gallery Assistant',
      description: 'Help users browse and interact with NFT collections',
      icon: '🖼️',
      category: 'nft',
      popular: false
    },
    {
      id: 'wallet-assistant',
      name: 'Wallet Assistant',
      description: 'Guide users through wallet setup and common operations',
      icon: '👛',
      category: 'utilities',
      popular: false
    },
    {
      id: 'dao-voting',
      name: 'DAO Voting Helper',
      description: 'Assist community members with DAO proposals and voting',
      icon: '🗳️',
      category: 'governance',
      popular: false
    },
  ];

  const filteredTemplates = searchQuery 
    ? templates.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : templates;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#ff3131]">AI</span> <span className="text-[#ffcc00]">Agent</span> <span className="text-white">Builder</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Choose a template to get started or create a custom agent from scratch. Each template comes with pre-configured capabilities.
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-12 bg-[#1a1a1a] border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#ffcc00]">Popular Templates</h2>
          <TemplateGallery templates={filteredTemplates.filter(t => t.popular)} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 text-[#ffcc00]">All Templates</h2>
          <TemplateGallery templates={filteredTemplates} />
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] p-6 rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Can't find what you need?</h3>
              <p className="text-gray-400">Build a custom agent with exactly the capabilities you want.</p>
            </div>
            <Link href="/agent-builder/custom">
              <motion.button 
                className="mt-4 md:mt-0 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold py-2 px-6 rounded-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Custom Agent
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}