"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// Solana wallet adapter imports
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// WalletConnectButton component to use inside Navbar
function WalletConnectButton() {
  const { publicKey, connected } = useWallet();
  
  return (
    <WalletMultiButton className="wallet-connect-button" />
  );
}

export default function Navbar({ isDashboard = false }) {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Same menu items as in sidebar
  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/agent-builder", label: "AI Agent Builder" },
    { path: "/api-keys", label: "API Keys & Embed" },
    { path: "/billing", label: "Billing" },
  ];

  // Set up wallet configuration
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network })
    ],
    [network]
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <header className="fixed top-0 w-full z-50">
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: scrollY > 50 || isDashboard ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <div className="container mx-auto px-6 py-4 flex justify-between items-center relative">
              <motion.div
                className="h-15 w-15 my-[-10] relative"
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "loop",
                }}>
                <Image
                  src="/logo.webp"
                  alt="Dumpling Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>

              {isDashboard ? (
                <div className="flex items-center gap-4">
                  <WalletConnectButton />
                </div>
              ) : (
                <div className="hidden md:flex gap-8 items-center">
                  <Link
                    href="https://shauns-organization-6.gitbook.io/dumplings/"
                    target="_blank">
                    <motion.div
                      className="relative flex items-center gap-2 overflow-hidden group"
                      whileHover={{ scale: 1.05 }}>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                          stroke="#ff3131"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 7H17"
                          stroke="#ff3131"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 11H17"
                          stroke="#ff3131"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7 15H13"
                          stroke="#ff3131"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-white group-hover:text-[#ff3131] transition-colors text-lg">
                        Docs
                      </span>
                      <motion.div
                        className="absolute bottom-0 left-0 h-[2px] bg-[#ff3131]"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </Link>
                  <Link href="/dashboard">
                    <motion.button
                      className="rounded-full bg-gradient-to-r from-[#ff3131] to-[#ffcc00] px-8 py-3 font-bold text-black transition-all flex items-center gap-2"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(255,204,0,0.5)",
                      }}
                      whileTap={{ scale: 0.98 }}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 13V12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12V13"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12L16 16"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 12V19"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Launch App</span>
                      <motion.div
                        className="ml-1"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 12H19"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 5L19 12L12 19"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </motion.button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button 
                className="md:hidden text-white p-2 z-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                  />
                </svg>
              </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-t border-gray-800 z-40"
                >
                  <div className="container mx-auto px-6 py-4">
                    {/* Show sidebar items */}
                    {isDashboard && (
                      <div className="mb-4">
                        <h3 className="text-[#ff3131] text-xs uppercase mb-2 font-semibold tracking-wider">
                          Dashboard Menu
                        </h3>
                        <div className="space-y-2">
                          {menuItems.map((item) => (
                            <Link 
                              key={item.path}
                              href={item.path} 
                              className={`block py-2 px-4 ${
                                pathname === item.path 
                                  ? "text-[#ff3131] font-medium" 
                                  : "text-white hover:text-[#ff3131]"
                              }`}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show main navigation items */}
                    {!isDashboard && (
                      <>
                        <Link
                          href="https://shauns-organization-6.gitbook.io/dumplings/"
                          target="_blank" 
                          className="block py-3 hover:text-[#ff3131]"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M7 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Docs</span>
                          </div>
                        </Link>
                        
                        <Link href="/dashboard" className="block py-3 mt-4 text-center">
                          <div className="bg-gradient-to-r from-[#ff3131] to-[#ffcc00] px-6 py-2 rounded-full font-bold text-black inline-flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13V12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12V13" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 12L16 16" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 12V19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Launch App</span>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}