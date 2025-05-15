import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ThoughtProcess from "./thoughtProcess";
import TokenChart from "./tokenChart";

/**
 * MessageItem Component
 * Displays a single message in the chat, with optional thought process and charts
 */
export default function MessageItem({ 
  message, 
  agentName, 
  showThoughts, 
  formatTime 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Message */}
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`max-w-[90%] px-4 py-3 rounded-lg ${
            message.role === 'user' 
              ? 'bg-gradient-to-r from-[#ff3131]/20 to-[#ffcc00]/20 text-white' 
              : message.error 
                ? 'bg-red-900/20 border border-red-800/50 text-red-200'
                : 'bg-[#1a1a1a] border border-gray-800 text-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">
              {message.role === 'user' ? 'You' : agentName}
            </span>
            {message.timestamp && (
              <span className="text-xs opacity-50 ml-2">
                {formatTime(message.timestamp)}
              </span>
            )}
          </div>
          <div className="prose prose-invert max-w-none prose-sm">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Token Price Chart - only show if message has token data */}
      {message.role === 'assistant' && message.tokenData && (
        <TokenChart 
          tokenData={message.tokenData}
          network={message.tokenData.network || 'sui'}
        />
      )}

      {/* AI Thought Process */}
      {message.role === 'assistant' && (
        <ThoughtProcess 
          thought={message.thought} 
          isVisible={showThoughts} 
        />
      )}
    </motion.div>
  );
}