'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function TemplateGallery({ templates }) {
  if (templates.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-10 text-center">
        <p className="text-gray-400">No templates found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden hover:border-[#ff3131] transition-colors group"
        >
          <Link href={`/agent-builder/${template.id}`}>
            <div className="p-6 cursor-pointer">
              <div className="text-4xl mb-4">{template.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-[#ffcc00] group-hover:text-white transition-colors">
                {template.name}
              </h3>
              <p className="text-gray-400">{template.description}</p>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="bg-[#2a2a2a] px-3 py-1 rounded-full text-xs text-gray-300">
                  {template.category}
                </span>
                <motion.span 
                  className="text-[#ff3131] font-medium flex items-center gap-1"
                  whileHover={{ x: 5 }}
                >
                  Use template 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}