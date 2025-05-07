'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function CreateKeyForm({ onCreateKey }) {
  const [keyName, setKeyName] = useState('');
  const [formVisible, setFormVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyName.trim()) {
      onCreateKey(keyName);
      setKeyName('');
      setFormVisible(false);
    }
  };

  return (
    <div className="mb-6">
      {!formVisible ? (
        <motion.button
          onClick={() => setFormVisible(true)}
          className="bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New API Key
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#1a1a1a] p-6 rounded-lg"
        >
          <h3 className="font-bold mb-4 text-[#ffcc00]">Create New API Key</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="key-name">
                Key Name
              </label>
              <input
                id="key-name"
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full p-3 bg-[#0a0a0a] border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3131]"
                placeholder="e.g. Production API Key"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#ff3131] hover:bg-[#ff3131]/80 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Create Key
              </button>
              <button
                type="button"
                onClick={() => setFormVisible(false)}
                className="text-gray-400 hover:text-white py-2 px-4 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}