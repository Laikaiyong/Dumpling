"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [agents, setAgents] = useState([
    { id: 1, name: "Solana Price Bot", type: "Finance", status: "Active" },
    { id: 2, name: "NFT Tracker", type: "Collection", status: "Inactive" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-[#0c0c0c] border-b border-gray-800">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#ff3131] to-[#ffcc00]" />
            <h1 className="font-bold text-xl text-white">
              <span className="text-[#ff3131]">Dum</span>
              <span className="text-[#ffcc00]">pling</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-[#1a1a1a] px-4 py-1 rounded-full flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Connected</span>
              <span className="text-xs text-gray-400">wAL...x3F</span>
            </div>
            <button className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-[#0a0a0a] border-r border-gray-800 p-4 hidden md:block">
          <div className="space-y-4">
            <div className="py-2 px-4 bg-[#1a1a1a] rounded-md text-[#ff3131] font-medium">Dashboard</div>
            <Link href="/agent-builder" className="block py-2 px-4 hover:bg-[#1a1a1a] rounded-md transition-colors">
              AI Agent Builder
            </Link>
            <Link href="/api-keys" className="block py-2 px-4 hover:bg-[#1a1a1a] rounded-md transition-colors">
              API Keys & Embed
            </Link>
            <Link href="/billing" className="block py-2 px-4 hover:bg-[#1a1a1a] rounded-md transition-colors">
              Billing
            </Link>
            <Link href="/settings" className="block py-2 px-4 hover:bg-[#1a1a1a] rounded-md transition-colors">
              Settings
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to Dumpling</h1>
            <p className="text-gray-400">Manage your AI agents, check usage stats, and more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { title: "Total Agents", value: "2", color: "#ff3131" },
              { title: "Total API Calls", value: "1,234", color: "#ffcc00" },
              { title: "Embed Views", value: "5,678", color: "#1eff89" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800"
              >
                <h2 className="text-gray-400 text-sm">{stat.title}</h2>
                <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your AI Agents</h2>
            <Link href="/agent-builder">
              <button className="bg-[#ff3131] hover:bg-[#ff3131]/80 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Agent
              </button>
            </Link>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0c0c0c]">
                <tr>
                  <th className="text-left py-4 px-6">Name</th>
                  <th className="text-left py-4 px-6">Type</th>
                  <th className="text-left py-4 px-6">Status</th>
                  <th className="text-left py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent.id} className="border-t border-gray-800">
                    <td className="py-4 px-6">{agent.name}</td>
                    <td className="py-4 px-6">{agent.type}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                        agent.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button className="p-1 hover:text-[#ff3131]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button className="p-1 hover:text-[#ff3131]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td className="py-8 px-6 text-center text-gray-400" colSpan={4}>
                      No agents created yet. Create your first agent!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}