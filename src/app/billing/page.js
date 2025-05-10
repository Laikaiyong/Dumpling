"use client";
import { useState, useRef, useEffect } from "react";
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
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

// Chinese characters for decoration related to money, payment, etc.
const chineseChars = ["费", "账", "付", "款", "财", "资"];

// Sample invoice data - updated to show SOL
const invoices = [
  { id: "INV-2025-001", date: "2025-04-01", amount: "2.5", status: "Paid" },
  { id: "INV-2025-002", date: "2025-05-01", amount: "2.5", status: "Paid" },
];

export default function BillingPage() {
  // TODO: These state variables will be used when implementing the billing plans UI
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });  const [usageData, setUsageData] = useState({
    apiCalls: 4521,
    apiLimit: 10000,
    agentsUsed: 4,
    agentLimit: 5,
  });

  // Use real wallet connection status
  const { publicKey, connected } = useWallet();

  const containerRef = useRef(null);
  const lanternRefs = useRef([]);

  // Scroll and mouse animations
  const { scrollY } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effects
  const backgroundY = useTransform(scrollY, [0, 300], [0, -30]);
  const floatingY = useSpring(useTransform(scrollY, [0, 300], [0, -20]), {
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

  // Handle plan change
  const handlePlanChange = (planId) => {
    setIsChangingPlan(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentPlan(planId);
      setIsChangingPlan(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#0a0808] to-[#1c0c0c] relative overflow-hidden"
      ref={containerRef}>
      {/* Background pattern - Chinese style lattice */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ y: backgroundY }}>
        <div className="absolute inset-0 bg-[url('/chinese-pattern.png')] bg-repeat opacity-10"></div>
      </motion.div>

      {/* Floating Chinese characters */}
      {chineseChars.map((char, index) => (
        <motion.div
          key={index}
          className={`absolute text-6xl opacity-5 hidden md:block`}
          style={{
            top: `${10 + ((index * 12) % 80)}%`,
            left: `${(index * 15) % 90}%`,
            color: index % 2 ? "#ff3131" : "#ffcc00",
            y: floatingY,
            rotate: index % 3 ? 10 : -10,
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [
              index % 3 ? 10 : -10,
              index % 3 ? -5 : 5,
              index % 3 ? 10 : -10,
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6 + (index % 4),
            repeat: Infinity,
            ease: "easeInOut",
          }}>
          {char}
        </motion.div>
      ))}

      {/* Dragon silhouette in background */}
      <motion.div
        className="absolute left-[-5%] bottom-[10%] w-[500px] h-[400px] opacity-[0.05] hidden lg:block"
        style={{
          backgroundImage:
            "url('https://www.seekpng.com/png/full/16-166429_chinese-dragon-silhouette-chinese-dragon-silhouette-chinese-dragon.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          y: useTransform(scrollY, [0, 300], [0, -40]),
        }}
      />

      {/* Floating lanterns */}
      <div className="absolute top-[10%] right-[8%]">
        <motion.div
          className="w-8 h-12 bg-gradient-to-b from-[#ff3131] to-[#ff6b6b] rounded-full relative"
          ref={(el) => (lanternRefs.current[0] = el)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ delay: 0.5 }}
        />
      </div>

      <div className="absolute top-[20%] left-[5%]">
        <motion.div
          className="w-6 h-10 bg-gradient-to-b from-[#ffcc00] to-[#ff9500] rounded-full relative"
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
          backgroundImage:
            "url('https://images.vexels.com/media/users/3/277684/isolated/preview/3151ab457fb33ac694c282334d269cd2-pair-of-chinese-clouds-color-stroke.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          x: transformedMouseX,
          y: transformedMouseY,
        }}
      />

      {/* Navbar */}
      <Navbar isDashboard={true} />

      <div className="flex min-h-screen pt-16">
        {/* Sidebar */}
        <Sidebar activePage="/billing" />

        {/* Main content */}
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
                💰
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                Billing & Subscription
              </motion.span>
            </h1>

            <p className="text-gray-400">
              Manage your subscription, payment methods, and billing history
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

          {/* Main content sections continue... */}

          {/* Payment Methods - Simplified wallet display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">Payment Methods</span>
                <motion.span
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                    y: [0, -3, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}>
                  👛
                </motion.span>
              </h2>

              {/* Only show wallet button if not connected */}
              {!connected && (
                <WalletMultiButton className="wallet-connect-button px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-md border border-gray-700" />
              )}
            </div>

            {/* Simplified wallet display */}
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Solana logo using regular img instead of Image component */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 relative overflow-hidden">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
                      alt="Solana Logo"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-medium">Solana Wallet</div>
                    <div className="text-sm text-gray-400 flex items-center">
                      {connected
                        ? `${publicKey.toString().slice(0, 6)}...${publicKey
                            .toString()
                            .slice(-4)}`
                        : "Not connected"}
                    </div>
                  </div>
                </div>

                {/* Simple connected status */}
                {connected && (
                  <span className="bg-green-900/30 text-green-400 text-xs border border-green-500/30 rounded-full px-2 py-1">
                    Connected
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Billing History - Updated Solana image in invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">Billing History</span>
                <motion.span
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                    y: [0, -3, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}>
                  📃
                </motion.span>
              </h2>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0c0c0c] to-[#181818]">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                      Invoice
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-[#ff3131]">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice.id}
                      className="border-t border-gray-800 hover:bg-[#222]"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{
                        backgroundColor: "rgba(255,49,49,0.05)",
                        boxShadow: "inset 0 0 20px rgba(255, 49, 49, 0.03)",
                      }}>
                      <td className="py-4 px-6">{invoice.id}</td>
                      <td className="py-4 px-6">{invoice.date}</td>
                      <td className="py-4 px-6">
                        <span className="flex items-center">
                          {invoice.amount}
                          <div className="ml-1 w-4 h-4 relative">
                            <img
                              src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
                              alt="Solana Logo"
                              className="w-4 h-4 object-contain"
                            />
                          </div>
                          <span className="ml-1">SOL</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block rounded-full px-2 py-1 text-xs bg-green-900/30 text-green-400 border border-green-500/30">
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <motion.a
                          href="https://explorer.solana.com"
                          target="_blank"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-[#ffcc00] hover:text-white flex items-center">
                          <span className="mr-1">View</span>
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </motion.a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom decoration */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#ff3131]/30 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
