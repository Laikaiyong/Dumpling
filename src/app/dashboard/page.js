"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

// Chinese zodiac animal icons for decoration
const zodiacAnimals = [
  "🐀",
  "🐂",
  "🐅",
  "🐇",
  "🐉",
  "🐍",
  "🐎",
  "🐑",
  "🐒",
  "🐓",
  "🐕",
  "🐖",
];

export default function Dashboard() {
  const [agents, setAgents] = useState([
    { id: 1, name: "Solana Price Bot", type: "Finance", status: "Active" },
    { id: 2, name: "NFT Tracker", type: "Collection", status: "Inactive" },
  ]);

  const { scrollY } = useScroll();
  const containerRef = useRef(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Create motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effect values
  const backgroundY = useTransform(scrollY, [0, 300], [0, -50]);
  const patternOpacity = useTransform(scrollY, [0, 200], [0.07, 0.03]);
  const patternScale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const floatingY = useSpring(useTransform(scrollY, [0, 300], [0, -30]), {
    stiffness: 50,
  });

  // Mouse position transforms
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
  }, []);

  // Floating lanterns
  const lanternRefs = useRef([]);
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
      ref={containerRef}>
      {/* Background pattern - Chinese style lattice */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          opacity: patternOpacity,
          y: backgroundY,
          scale: patternScale,
        }}>
        <div className="absolute inset-0 bg-[url('https://static.vecteezy.com/system/resources/thumbnails/015/098/526/small/chinese-clouds-illustration-png.png')] bg-repeat opacity-10"></div>
      </motion.div>

      {/* Floating vector shapes */}
      <motion.div
        className="absolute top-[10%] right-[5%] text-6xl text-[#ff3131]/10 rotate-12"
        style={{ y: floatingY }}
        animate={{ rotate: [12, -5, 12], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
        福
      </motion.div>
      <motion.div
        className="absolute bottom-[15%] left-[8%] text-7xl text-[#ffcc00]/10 -rotate-6"
        style={{ y: useTransform(scrollY, [0, 300], [0, -15]) }}
        animate={{ rotate: [-6, 4, -6], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
        运
      </motion.div>

      {/* Dragon silhouette in background */}
      <motion.div
        className="absolute right-[-10%] top-[30%] w-[600px] h-[400px] opacity-[0.07]"
        style={{
          backgroundImage: "url('https://www.seekpng.com/png/full/16-166429_chinese-dragon-silhouette-chinese-dragon-silhouette-chinese-dragon.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          y: useTransform(scrollY, [0, 300], [0, -40]),
        }}
      />

      <motion.div
        className="absolute right-[5%] top-[5%] w-24 h-12 opacity-10"
        style={{
          backgroundImage: "url('https://images.vexels.com/media/users/3/277684/isolated/preview/3151ab457fb33ac694c282334d269cd2-pair-of-chinese-clouds-color-stroke.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          x: transformedMouseX,
          y: transformedMouseY,
        }}
      />

      {/* Navbar should be outside other containers */}
      <Navbar isDashboard={true} />

      <div className="flex min-h-screen pt-16">
        {/* Sidebar with enhanced styling */}
        <Sidebar activePage="/dashboard" />
        
        {/* Main content area */}
        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 relative">
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
                🏮
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                Welcome to Dumpling
              </motion.span>
            </h1>

            <div className="relative">
              <p className="text-gray-400">
                Manage your AI agents, check usage stats, and more.
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
            </div>
          </motion.div>

          {/* Stats Cards with enhanced 3D & Chinese elements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                title: "Total Agents",
                value: "2",
                color: "#ff3131",
                icon: "🤖",
                symbol: "机",
              },
              {
                title: "Total API Calls",
                value: "1,234",
                color: "#ffcc00",
                icon: "🔄",
                symbol: "通",
              },
              {
                title: "Embed Views",
                value: "5,678",
                color: "#1eff89",
                icon: "👁️",
                symbol: "视",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 10px 30px ${stat.color}20`,
                  rotateX: 5,
                  rotateY: 5,
                }}
                className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 relative overflow-hidden backdrop-blur-sm"
                style={{
                  background: `radial-gradient(circle at 30% 107%, #1a1a1a 0%, #121212 90%)`,
                  perspective: "1000px",
                }}>
                <motion.div
                  className="absolute -right-3 top-2 text-5xl font-bold"
                  style={{
                    color: `${stat.color}10`,
                    fontFamily: "'Ma Shan Zheng', cursive",
                  }}
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}>
                  {stat.symbol}
                </motion.div>

                <div className="absolute -right-6 -top-6 opacity-10 text-5xl">
                  {stat.icon}
                </div>

                <motion.div
                  className="absolute bottom-0 left-0 h-1"
                  style={{
                    backgroundColor: stat.color,
                    width: "30%",
                    borderRadius: "0 4px 0 0",
                  }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.8 }}
                />

                <div className="relative">
                  <h2 className="text-gray-400 text-sm">{stat.title}</h2>
                  <motion.p
                    className="text-3xl font-bold"
                    style={{ color: stat.color }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}>
                    {stat.value}
                  </motion.p>

                  {/* Decorative corner */}
                  <motion.div
                    className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr"
                    style={{ borderColor: `${stat.color}50` }}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Agents Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-2">Your AI Agents</span>
                <motion.span
                  className="text-[#ff3131] text-xl"
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                    y: [0, -3, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  🥟
                </motion.span>
              </h2>
              {/* Chinese calligraphy brush stroke under title */}
              <motion.div
                className="absolute -bottom-3 left-0 w-32 h-2"
                style={{
                  backgroundImage: "url('https://static.vecteezy.com/system/resources/thumbnails/012/634/568/small_2x/red-acrylic-paint-strokes-for-design-elements-artistic-brush-strokes-for-ornament-and-lower-thirds-isolated-background-png.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.7 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              />
            </div>

            <Link href="/agent-builder">
              <motion.button
                className="bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:from-[#ff4545] hover:to-[#ffd633] px-5 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 text-black relative overflow-hidden group"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(255, 49, 49, 0.5)",
                }}
                whileTap={{ scale: 0.97 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Agent
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%", opacity: 0.3 }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                {/* Red seal imprint effect */}
                <motion.div
                  className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full"
                  style={{
                    background: "url('https://upload.wikimedia.org/wikipedia/commons/5/5e/Chinese_seal_%28zhubai%29.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                  }}
                  whileHover={{ rotate: [0, 15] }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden shadow-lg shadow-[#ff3131]/5 relative">
            {/* Dragon corner decoration */}
            <motion.div
              className="absolute top-0 right-0 w-24 h-24 opacity-5 z-0 pointer-events-none"
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

            <table className="w-full relative z-10">
              <thead className="bg-gradient-to-r from-[#0c0c0c] to-[#181818]">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <motion.tr
                    key={agent.id}
                    className="border-t border-gray-800 hover:bg-[#222]"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index + 0.5 }}
                    whileHover={{
                      backgroundColor: "rgba(255,49,49,0.05)",
                      boxShadow: "inset 0 0 20px rgba(255, 49, 49, 0.03)",
                    }}>
                    <td className="py-4 px-6 font-medium flex items-center">
                      <motion.div
                        className="mr-3 w-6 h-6 bg-gradient-to-br from-[#ff3131]/20 to-[#ffcc00]/20 rounded-full flex items-center justify-center text-xs"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}>
                        {zodiacAnimals[index % zodiacAnimals.length]}
                      </motion.div>
                      {agent.name}
                    </td>
                    <td className="py-4 px-6">{agent.type}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          agent.status === "Active"
                            ? "bg-green-900/30 text-green-400 border border-green-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}>
                        {agent.status === "Active" && (
                          <motion.span
                            className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <motion.button
                          className="p-1 hover:text-[#ff3131]"
                          whileHover={{
                            scale: 1.2,
                            rotate: 15,
                            boxShadow: "0 0 10px rgba(255, 49, 49, 0.7)",
                          }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          className="p-1 hover:text-[#ff3131]"
                          whileHover={{
                            scale: 1.2,
                            rotate: -15,
                            boxShadow: "0 0 10px rgba(255, 49, 49, 0.7)",
                          }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {agents.length === 0 && (
                  <tr>
                    <td
                      className="py-8 px-6 text-center text-gray-400"
                      colSpan={4}>
                      No agents created yet. Create your first agent!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Bottom decoration */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#ff3131]/30 to-transparent"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}