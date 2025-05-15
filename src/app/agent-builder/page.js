"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useSpring, useAnimationFrame, useMotionValue } from 'framer-motion';
import { TemplateGallery } from './components/templateGallery';
import Link from 'next/link';
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import AdminButton from "./components/adminButton";  // Import from the main components directory

// Chinese zodiac animal icons for template categories
const categoryIcons = {
  'finance': '🐉', // dragon for finance
  'analytics': '🐯', // tiger for analytics
  'business': '🐂', // ox for business
  'nft': '🐒', // monkey for NFTs
  'utilities': '🐍', // snake for utilities
  'governance': '🐓', // rooster for governance
};

// Chinese characters for decoration
const chineseChars = ['福', '运', '智', '富', '禄', '寿', '喜', '财', '成'];

export default function AgentBuilder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  // Refs for animated elements
  const lanternRefs = useRef([]);
  const containerRef = useRef(null);
  
  // Scroll and mouse animations
  const { scrollY } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Parallax effects
  const backgroundY = useTransform(scrollY, [0, 300], [0, -30]);
  const floatingY = useSpring(useTransform(scrollY, [0, 300], [0, -20]), {
    stiffness: 50,
  });

  const [agents, setAgents] = useState([]);
  const router = useRouter();
  
  // Mouse position transforms for interactive elements
  const transformedMouseX = useTransform(
    mouseX,
    [0, windowSize.width || 1],
    [-10, 10]
  );
  const transformedMouseY = useTransform(
    mouseY,
    [0, windowSize.height || 1],
    [-10, 10]
  );

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agent');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        
        const data = await response.json();
        if (data.agents && Array.isArray(data.agents)) {
          setAgents(data.agents);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    
    fetchAgents();
  }, []);
  
  // Handle agent selection
  const handleSelectAgent = (agentId) => {
    router.push(`/agent/${agentId}`);
  };

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
  
  // Filter templates based on search query (keep existing code)
  const filteredTemplates = searchQuery 
    ? templates.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : templates;
  
  // Filter agents based on search query
  const filteredAgents = searchQuery
    ? agents.filter(agent =>
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents;

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Handle window resize
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [mouseX, mouseY]);

  // Floating lanterns animation
  useAnimationFrame((t) => {
    lanternRefs.current.forEach((lantern, i) => {
      if (lantern) {
        // Create gentle floating motion
        lantern.style.transform = `translateY(${Math.sin(t / 1000 + i) * 8}px)`;
      }
    });
  });

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c] relative overflow-hidden"
      ref={containerRef}
    >
      {/* Background pattern - Chinese style lattice */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/thumbnails/015/098/526/small/chinese-clouds-illustration-png.png')] bg-repeat opacity-10"></div>
      </motion.div>

      {/* Floating Chinese characters */}
        {chineseChars.map((char, index) => (
          <motion.div
            key={index}
            className={`absolute text-6xl opacity-5 hidden md:block`}
            style={{ 
          top: `${10 + (index * 7) % 80}%`,
          left: `${30 + (index * 13) % 90}%`, // Adjusted left position to avoid sidebar area
          // Ensure characters are at least 250px from the left edge where the sidebar is
          transform: `translateX(${Math.max(250 - ((index * 13) % 90) * (windowSize.width/100), 0)}px)`,
          color: index % 2 ? '#ff3131' : '#ffcc00',
          y: floatingY,
          rotate: index % 3 ? 10 : -10,
          zIndex: -1 // Ensure characters appear behind other content
            }}
            animate={{
          y: [0, -15, 0],
          rotate: [index % 3 ? 10 : -10, index % 3 ? -5 : 5, index % 3 ? 10 : -10],
          scale: [1, 1.05, 1]
            }}
            transition={{
          duration: 6 + index % 4,
          repeat: Infinity,
          ease: "easeInOut"
            }}
          >
            {char}
          </motion.div>
        ))}
        
        {/* Dragon silhouette in background */}
      <motion.div
        className="absolute left-[20%] top-[10%] w-[500px] h-[400px] opacity-[0.05] hidden lg:block"
        style={{
          backgroundImage: "url('https://www.seekpng.com/png/full/16-166429_chinese-dragon-silhouette-chinese-dragon-silhouette-chinese-dragon.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          y: useTransform(scrollY, [0, 300], [0, -40]),
        }}
      />
      
      {/* Floating lanterns */}
      <div className="absolute top-[10%] right-[10%]">
        <motion.div
          className="w-8 h-12 bg-gradient-to-b from-[#ff3131] to-[#ff6b6b] rounded-full relative"
          ref={(el) => (lanternRefs.current[0] = el)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ delay: 0.5 }}
        />
      </div>
      
      <div className="absolute top-[20%] left-[7%]">
        <motion.div
          className="w-6 h-10 bg-gradient-to-b from-[#ffcc00] to-[#ffa500] rounded-full relative"
          ref={(el) => (lanternRefs.current[1] = el)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 0.8 }}
        />
      </div>
      
      {/* Cloud pattern that follows mouse */}
      <motion.div
        className="absolute right-[15%] bottom-[15%] w-32 h-20 opacity-10"
        style={{
          backgroundImage: "url('https://images.vexels.com/media/users/3/277684/isolated/preview/3151ab457fb33ac694c282334d269cd2-pair-of-chinese-clouds-color-stroke.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          x: transformedMouseX,
          y: transformedMouseY,
        }}
      />

      <AdminButton />

      {/* Navbar */}
      <Navbar isDashboard={true} />
      
      <div className="flex min-h-screen pt-16">
        {/* Sidebar */}
        <Sidebar activePage="/agent-builder" />
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 relative"
          >
            {/* Decorative flourish */}
            <motion.div
              className="absolute left-[-15px] top-0 h-full w-1"
              style={{
                background: "linear-gradient(to bottom, #ff3131, transparent)",
                boxShadow: "0 0 8px rgba(255,49,49,0.5)",
              }}
              animate={{ height: ["0%", "100%"] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] to-[#ffcc00] flex items-center">
              <motion.span
                className="mx-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3, type: "spring" }}>
                🤖
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                AI Agent Builder
              </motion.span>
            </h1>
            
            <p className="text-gray-400 max-w-2xl ml-2">
              Choose a template to get started or create a custom agent from scratch. Each template comes with pre-configured capabilities.
            </p>
            
            {/* Decorative line with animated dash */}
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
                <linearGradient
                  id="redGoldGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0">
                  <stop offset="0%" stopColor="#ff3131" />
                  <stop offset="100%" stopColor="#ffcc00" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <div className="mb-8 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 bg-[#1a1a1a] border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff3131] shadow-inner shadow-black/30"
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
              
              {/* Chinese fan decoration */}
              <motion.div
                className="absolute -top-3 -right-3 w-10 h-10 opacity-30"
                style={{
                  backgroundImage: "url('https://ae01.alicdn.com/kf/S1d46c80508cc4728804c6fa2ad1f39aeb.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12"
          >
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold text-[#ffcc00]">Your Agents</h2>
              <motion.div
                className="ml-3 text-2xl"
                animate={{
                  rotate: [0, 10, 0, -10, 0],
                  y: [0, -3, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}>
                🤖
              </motion.div>
              
              {/* Chinese calligraphy brush stroke under title */}
              <motion.div
                className="absolute mt-10 w-28 h-2"
                style={{
                  backgroundImage: "url('https://static.vecteezy.com/system/resources/thumbnails/012/634/568/small_2x/red-acrylic-paint-strokes-for-design-elements-artistic-brush-strokes-for-ornament-and-lower-thirds-isolated-background-png.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.7 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              />
            </div>
            
            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent, index) => (
                  <motion.div
                    key={agent._id}
                    className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 relative overflow-hidden group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 30px rgba(255, 49, 49, 0.1)" 
                    }}
                    onClick={() => handleSelectAgent(agent._id)}
                  >
                    {/* Red corner seal */}
                    <motion.div
                      className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ rotate: 15 }}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full text-[#ff3131]/10">
                        <path d="M0,0 L100,0 L100,100 Z" fill="currentColor" />
                      </svg>
                    </motion.div>
                    
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ff3131]/10 to-[#ffcc00]/10 rounded-lg flex items-center justify-center text-2xl mr-4">
                        🤖
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">{agent.name}</h3>
                        <div className="flex items-center">
                          <span className="text-sm bg-[#0f0f0f] px-2 py-0.5 rounded flex items-center">
                            <span className="mr-1">✨</span> 
                            {agent.type || "General"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-4 text-sm">{agent.description}</p>
                    
                    <div className="flex justify-end">
                      <motion.button
                        className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded-md flex items-center transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Open Agent</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 text-center">
                <p className="text-gray-400">You haven&apos;t created any agents yet.</p>
                <Link href="/create">
                  <motion.button
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold rounded-lg transition-all"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 49, 49, 0.4)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Create Your First Agent
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="mt-12 bg-[#1a1a1a] p-8 rounded-lg border border-gray-800 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ boxShadow: "0 10px 30px rgba(255, 49, 49, 0.07)" }}
          >
            {/* Dragon corner decoration */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
              style={{
                background: "url('https://images.vexels.com/media/users/3/282629/isolated/preview/5b4f6600ccbdb881f8870f02419820ec-chinese-new-year-dragon-zodiac-sign.png')",
                backgroundSize: "contain",
                backgroundPosition: "top right",
                backgroundRepeat: "no-repeat",
              }}
              animate={{
                opacity: [0.05, 0.08, 0.05],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            
            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
              <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff3131] to-[#ffcc00] mb-2">
                  Can&apos;t find what you need?
                </h3>
                <p className="text-gray-400">Build a custom agent with exactly the capabilities you want.</p>
              </div>
              <Link href="/create">
                <motion.button 
                  className="mt-6 md:mt-0 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold py-3 px-8 rounded-lg transition-all relative overflow-hidden group"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 49, 49, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Customize
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: "-100%", opacity: 0.3 }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}