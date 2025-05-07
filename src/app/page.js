"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef(null);
  const sections = useRef([]);
  const { scrollYProgress } = useScroll();

  const features = [
    {
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="#ffcc00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="#ffcc00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="#ffcc00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Blockchain Integration",
      description:
        "Seamlessly connect your AI agents with Solana blockchain for secure and transparent operations.",
    },
    {
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 11.5C21 15.6421 16.9706 19 12 19C7.02944 19 3 15.6421 3 11.5C3 7.35786 7.02944 4 12 4C16.9706 4 21 7.35786 21 11.5Z"
            stroke="#ff3131"
            strokeWidth="2"
          />
          <path
            d="M12 12V8"
            stroke="#ff3131"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 10L12 12"
            stroke="#ff3131"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="1" fill="#ff3131" />
          <path
            d="M4 20L8 16"
            stroke="#ff3131"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 20L16 16"
            stroke="#ff3131"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "AI Agent Builder",
      description:
        "Create powerful AI agents with no-code tools that handle complex blockchain interactions.",
    },
    {
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 12L11 14L15 10"
            stroke="#ffcc00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3L17.1962 5.52786C17.6913 5.7773 18 6.29808 18 6.86852V17.1315C18 17.7019 17.6913 18.2227 17.1962 18.4721L12 21L6.80385 18.4721C6.30865 18.2227 6 17.7019 6 17.1315V6.86852C6 6.29808 6.30865 5.7773 6.80385 5.52786L12 3Z"
            stroke="#ffcc00"
            strokeWidth="2"
          />
        </svg>
      ),
      title: "Content Verification",
      description:
        "Built-in verification systems ensure all AI-generated content is secure and trustworthy.",
    },
  ];

  // Background images for different sections
  const backgrounds = [
    "https://i.pinimg.com/736x/a2/b9/52/a2b952006726aebaad67ba9b4a09497c.jpg",
    "https://img.freepik.com/premium-photo/illustration-night-sky-with-clouds-stars-moon-traditional-chinese-style-with-golden-lines-dark-blue-background_1361981-8557.jpg",
    "https://img.freepik.com/premium-vector/vector-oriental-chinese-border-ornament-red-background_921039-2502.jpg?semt=ais_hybrid&w=740",
  ];

  // Transform values based on scroll
  const dragonX = useTransform(scrollYProgress, [0, 1], ["-100%", "100%"]);
  const dragonY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["0%", "-20%", "0%"]
  );
  const pagodaOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const pagodaScale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);
  const cloudLeftX = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const cloudRightX = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Parallax effects
  const parallaxSlow = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const parallaxMedium = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const parallaxFast = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const parallaxReverse = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Determine which section is currently in view
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      const currentSection = sections.current.findIndex((section) => {
        if (!section) return false;
        const { offsetTop, offsetHeight } = section;
        return (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        );
      });

      if (currentSection !== -1 && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [activeSection]);

  // Animation variants for steam effect
  const steamVariants = {
    initial: { opacity: 0, y: 0 },
    animate: {
      opacity: [0, 1, 0],
      y: -30,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
      },
    },
  };

  // Animation variants for floating elements
  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <div className="min-h-screen overflow-hidden relative" ref={containerRef}>
      {/* Swipable backgrounds based on section */}
      <AnimatePresence>
        {backgrounds.map((bg, index) => (
          <motion.div
            key={`background-${index}`}
            className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: activeSection === index ? 1 : 0,
            }}
            transition={{ duration: 1.2 }}
            style={{
              backgroundImage: `url(${bg})`,
              filter: "brightness(0.4) saturate(1.2)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Overlay with gradient for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 z-0" />

      {/* Chinese pattern background overlay */}
      <div className="fixed inset-0 bg-[url('/chinese-pattern.png')] opacity-10 pointer-events-none z-0" />

      {/* Animated clouds with parallax effect */}
      <motion.div
        className="fixed top-[15%] left-0 w-[300px] h-[150px] opacity-30 pointer-events-none z-0"
        style={{ x: cloudLeftX, y: parallaxSlow }}>
        <Image
          src="https://images.vexels.com/media/users/3/277684/isolated/preview/3151ab457fb33ac694c282334d269cd2-pair-of-chinese-clouds-color-stroke.png"
          alt="Chinese cloud pattern"
          width={300}
          height={150}
        />
      </motion.div>

      <motion.div
        className="fixed top-[30%] right-0 w-[250px] h-[120px] opacity-30 pointer-events-none z-0"
        style={{ x: cloudRightX, y: parallaxMedium }}>
        <Image
          src="https://images.vexels.com/media/users/3/277684/isolated/preview/3151ab457fb33ac694c282334d269cd2-pair-of-chinese-clouds-color-stroke.png"
          alt="Chinese cloud pattern"
          width={250}
          height={120}
        />
      </motion.div>

      {/* Flying dragon animation - updated with new GIF */}
      <motion.div
        className="fixed pointer-events-none z-10"
        style={{ x: dragonX, y: dragonY, top: "25%" }}>
        <motion.div
          animate={{
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "loop",
          }}>
          <Image
            src="https://i.pinimg.com/originals/72/7f/40/727f40d441ae03b2176c10f7b3267e6b.gif"
            alt="Flying Chinese dragon"
            width={350}
            height={175}
            className="opacity-80"
          />
        </motion.div>
      </motion.div>

      {/* Reactive floating lanterns based on mouse position - updated with new image */}
      <motion.div
        className="fixed top-[10%] left-[10%] w-[100px] h-[200px] opacity-70 pointer-events-none z-10"
        animate={floatingVariants.animate}
        style={{
          x: mousePosition.x / 50,
          y: mousePosition.y / 50 - 20,
        }}>
        <Image
          src="https://pngimg.com/d/chinese_new_year_PNG94.png"
          alt="Chinese lantern"
          width={100}
          height={200}
        />
      </motion.div>

      <motion.div
        className="fixed top-[15%] right-[15%] w-[80px] h-[160px] opacity-70 pointer-events-none z-10"
        animate={floatingVariants.animate}
        style={{
          x: -mousePosition.x / 60,
          y: mousePosition.y / 60 - 10,
        }}>
        <Image
          src="https://pngimg.com/d/chinese_new_year_PNG94.png"
          alt="Chinese lantern"
          width={80}
          height={160}
        />
      </motion.div>

      {/* Enhanced Header with SVG infographics */}
      <header className="fixed top-0 w-full z-50">
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollY > 50 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <div className="container mx-auto px-6 py-4 flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-15 w-15 relative"
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
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
          </div>

          <div className="hidden md:flex gap-8 items-center">
            <Link href="/docs">
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
                <motion.div
                  className="absolute -right-2 -top-2 w-8 h-8 opacity-0 group-hover:opacity-100"
                  initial={{ rotate: -20 }}
                  whileHover={{ rotate: 0 }}
                  transition={{ duration: 0.3 }}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                      fill="#ffcc00"
                    />
                  </svg>
                </motion.div>
              </motion.div>
            </Link>
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
          </div>

          <button className="md:hidden text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Chinese architectural element - pagoda silhouette with parallax */}
      <motion.div
        className="fixed bottom-0 right-0 w-[350px] h-[450px] pointer-events-none z-0 opacity-30"
        style={{
          opacity: pagodaOpacity,
          scale: pagodaScale,
          x: mousePosition.x / -80,
          y: mousePosition.y / -80 + parallaxReverse,
        }}>
        <Image
          src="https://png.pngtree.com/png-vector/20250225/ourmid/pngtree-create-a-very-simple-single-pagoda-black-logo-silhouette-png-image_15577717.png"
          alt="Chinese pagoda silhouette"
          fill
          objectFit="contain"
        />
      </motion.div>

      {/* Hero section with enhanced SVG decorations */}
      <motion.section
        ref={(el) => (sections.current[0] = el)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-20 px-6 relative min-h-screen">
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16">
            {/* Enhanced heading with SVG decorations */}
            <div className="relative">
              <motion.div
                className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-20 opacity-30"
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                }}>
                <svg
                  viewBox="0 0 200 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M30,10 C50,30 150,30 170,10 S190,40 170,50 S50,50 30,50 S10,30 30,10"
                    stroke="#ffcc00"
                    strokeWidth="2"
                  />
                  <path
                    d="M50,20 C70,40 130,40 150,20"
                    stroke="#ff3131"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8">
                <motion.span
                  className="text-[#ff3131] inline-block relative"
                  animate={{
                    textShadow: [
                      "0 0 5px rgba(255,49,49,0)",
                      "0 0 15px rgba(255,49,49,0.5)",
                      "0 0 5px rgba(255,49,49,0)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}>
                  <svg
                    className="absolute -top-8 -left-8 w-16 h-16 opacity-60"
                    viewBox="0 0 100 100"
                    fill="none">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#ff3131"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <path
                      d="M30,50 Q50,30 70,50 T40,70"
                      stroke="#ff3131"
                      strokeWidth="2"
                    />
                  </svg>
                  AI Agent Builder
                  <svg
                    className="absolute -bottom-2 -right-5 w-10 h-10 opacity-60"
                    viewBox="0 0 100 100"
                    fill="none">
                    <path
                      d="M20,50 L40,30 L60,50 L80,30"
                      stroke="#ff3131"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M20,70 L40,50 L60,70 L80,50"
                      stroke="#ff3131"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.span>
                <br />
                <motion.span
                  className="text-[#ffcc00] inline-block mt-2 relative"
                  animate={{
                    textShadow: [
                      "0 0 5px rgba(255,204,0,0)",
                      "0 0 15px rgba(255,204,0,0.5)",
                      "0 0 5px rgba(255,204,0,0)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}>
                  <svg
                    className="absolute -left-10 top-1/2 w-8 h-8 transform -translate-y-1/2 opacity-70"
                    viewBox="0 0 100 100"
                    fill="none">
                    <rect
                      x="25"
                      y="25"
                      width="50"
                      height="50"
                      stroke="#ffcc00"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="20"
                      stroke="#ffcc00"
                      strokeWidth="2"
                    />
                  </svg>
                  for Web3
                  <svg
                    className="absolute -right-12 top-1/2 w-10 h-10 transform -translate-y-1/2 opacity-60"
                    viewBox="0 0 100 100"
                    fill="none">
                    <rect
                      x="25"
                      y="25"
                      width="50"
                      height="50"
                      stroke="#ffcc00"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="20"
                      stroke="#ffcc00"
                      strokeWidth="2"
                    />
                  </svg>
                </motion.span>
              </h1>

              <motion.p
                className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-200 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}>
                <svg
                  className="absolute -left-10 top-1/2 w-6 h-6 transform -translate-y-1/2 opacity-40"
                  viewBox="0 0 100 100"
                  fill="none">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ffcc00"
                    strokeWidth="2"
                  />
                  <path
                    d="M30,50 H70"
                    stroke="#ffcc00"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50,30 V70"
                    stroke="#ffcc00"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Create, deploy and monetize AI agents that interact with the
                Solana blockchain, with built-in verification for AI-generated
                content.
                <svg
                  className="absolute -right-10 top-1/2 w-6 h-6 transform -translate-y-1/2 opacity-40"
                  viewBox="0 0 100 100"
                  fill="none">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ff3131"
                    strokeWidth="2"
                  />
                  <path
                    d="M30,50 H70"
                    stroke="#ff3131"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50,30 V70"
                    stroke="#ff3131"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.p>
            </div>
          </motion.div>

          {/* Enhanced CTA buttons with SVG */}
          <motion.div
            className="flex flex-col md:flex-row gap-6 justify-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}>
            <Link href="/dashboard">
              <motion.button
                className="w-full md:w-auto bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold py-4 px-12 rounded-lg transition-all text-lg flex items-center gap-2 relative overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(255,49,49,0.5)",
                }}
                whileTap={{ scale: 0.98 }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 15L15 12M15 12L12 9M15 12H3"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H10"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Get Started</span>
                <motion.div
                  className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#ffcc00] to-transparent opacity-30"
                  animate={{
                    x: [50, 0, 50],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </motion.button>
            </Link>
            <Link href="/learn">
              <motion.button
                className="w-full md:w-auto border-2 border-[#ffcc00] hover:bg-[#ffcc00]/10 py-4 px-12 rounded-lg transition-all text-lg flex items-center gap-2"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(255,204,0,0.3)",
                }}
                whileTap={{ scale: 0.98 }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 6V12L16 14"
                    stroke="#ffcc00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#ffcc00"
                    strokeWidth="2"
                  />
                </svg>
                <span>Learn More</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9.5 6.5L15.5 12L9.5 17.5"
                    stroke="#ffcc00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* AI Agent demo card with enhanced SVG elements */}
        <motion.div
          className="mt-20 relative"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ y: parallaxMedium }}>
          <div className="relative w-full h-[500px] bg-gradient-to-b from-[#232323] to-[#121212] rounded-xl overflow-hidden border border-gray-800">
            {/* Chinese lanterns overlay - remain unchanged */}
            <div className="absolute -top-10 left-10 opacity-60 w-20 h-40 pointer-events-none">
              <Image
                src="https://pngimg.com/d/chinese_new_year_PNG94.png"
                alt="Chinese lantern"
                width={80}
                height={160}
              />
            </div>
            <div className="absolute -top-5 right-20 opacity-60 w-16 h-32 pointer-events-none">
              <Image
                src="https://pngimg.com/d/chinese_new_year_PNG94.png"
                alt="Chinese lantern"
                width={64}
                height={128}
              />
            </div>

            {/* Add decorative SVG elements to the demo card */}
            <motion.div
              className="absolute top-10 left-10 opacity-20 w-40 h-40 pointer-events-none"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear",
              }}>
              <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  strokeDasharray="10,5"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="50"
                  stroke="#ff3131"
                  strokeWidth="2"
                />
                <path
                  d="M60,100 Q100,50 140,100 T60,100"
                  stroke="#ffcc00"
                  strokeWidth="2"
                />
              </svg>
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 flex items-center justify-center">
                  <motion.span
                    className="inline-block mr-2"
                    animate={{
                      rotate: [0, 10, 0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}>
                    ✨
                  </motion.span>
                  AI Agent Demo
                  <motion.span
                    className="inline-block ml-2"
                    animate={{
                      rotate: [0, -10, 0, 10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5,
                    }}>
                    ✨
                  </motion.span>
                </div>
                <p className="text-gray-400 flex items-center justify-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5 12H19"
                      stroke="#ff3131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 5L19 12L12 19"
                      stroke="#ff3131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Connect wallet to preview
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M19 12H5"
                      stroke="#ff3131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 5L5 12L12 19"
                      stroke="#ff3131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="h-2 w-2 rounded-full bg-[#ff3131] animate-pulse"></span>
                <span className="flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="#ff3131"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3L17.1962 5.52786C17.6913 5.7773 18 6.29808 18 6.86852V17.1315C18 17.7019 17.6913 18.2227 17.1962 18.4721L12 21L6.80385 18.4721C6.30865 18.2227 6 17.7019 6 17.1315V6.86852C6 6.29808 6.30865 5.7773 6.80385 5.52786L12 3Z"
                      stroke="#ff3131"
                      strokeWidth="2"
                    />
                  </svg>
                  Verified on Solana
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature cards with enhanced SVG icons - leaving as is since they already have SVG icons */}
        <motion.div
          className="mt-32 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="backdrop-blur-sm bg-black/30 border border-gray-800 p-8 rounded-xl relative overflow-hidden group"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 30px -10px rgba(255, 204, 0, 0.3)",
                  borderColor: index % 2 === 0 ? "#ffcc00" : "#ff3131",
                }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-transparent to-[#ffcc00]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-80 transition-opacity" />

                <motion.div
                  className="mb-5"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}>
                  {feature.icon}
                </motion.div>

                <h3 className="text-xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#ff3131] to-[#ffcc00] group-hover:w-full transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Add new Pricing Section with Chinese styling */}
      <section
        ref={(el) => (sections.current[2] = el)} // Adjust indices as needed
        className="py-20 px-6 relative min-h-screen">
        <motion.div
          className="absolute inset-0 z-0 opacity-25"
          style={{
            backgroundImage:
              "url('https://img.freepik.com/premium-vector/vector-oriental-chinese-border-ornament-red-background_921039-2502.jpg?semt=ais_hybrid&w=740')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            y: parallaxSlow,
          }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-[#ffcc00]">Pricing</span>{" "}
              <span className="text-[#ff3131]">Plans</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-gray-200">
              Choose the perfect plan for your AI agents with our flexible
              pricing options. All plans are charged in SOL tokens.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {/* Basic Plan */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}>
              {/* Chinese-styled border with SVG */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M30,10 H370 C380,10 390,20 390,30 V470 C390,480 380,490 370,490 H30 C20,490 10,480 10,470 V30 C10,20 20,10 30,10 Z"
                  stroke="url(#goldGradient)"
                  strokeWidth="3"
                />
                <path
                  d="M40,20 H360 C370,20 380,30 380,40 V460 C380,470 370,480 360,480 H40 C30,480 20,470 20,460 V40 C20,30 30,20 40,20 Z"
                  stroke="#ff3131"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <path
                  d="M0,60 Q10,50 20,60 T40,60 T60,60 T80,60 T100,60 T120,60 T140,60 T160,60 T180,60 T200,60 T220,60 T240,60 T260,60 T280,60 T300,60 T320,60 T340,60 T360,60 T380,60 T400,60"
                  stroke="#ffcc00"
                  strokeWidth="2"
                />
                <path
                  d="M0,440 Q10,430 20,440 T40,440 T60,440 T80,440 T100,440 T120,440 T140,440 T160,440 T180,440 T200,440 T220,440 T240,440 T260,440 T280,440 T300,440 T320,440 T340,440 T360,440 T380,440 T400,440"
                  stroke="#ffcc00"
                  strokeWidth="2"
                />
                <circle cx="50" cy="50" r="15" fill="#ff3131" opacity="0.7" />
                <circle cx="350" cy="50" r="15" fill="#ff3131" opacity="0.7" />
                <circle cx="50" cy="450" r="15" fill="#ff3131" opacity="0.7" />
                <circle cx="350" cy="450" r="15" fill="#ff3131" opacity="0.7" />
                <defs>
                  <linearGradient
                    id="goldGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="p-8 pt-14 backdrop-blur-sm bg-black/30 h-full flex flex-col">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-8 py-2 border-2 border-[#ff3131] rounded-full">
                  <h3 className="text-xl font-bold text-[#ffcc00]">Starter</h3>
                </div>

                <div className="mb-6 text-center">
                  <div className="text-4xl font-bold mb-2 flex items-center justify-center">
                    <span className="text-[#ffcc00]">0.5</span>
                    <svg
                      className="h-6 w-6 ml-2"
                      viewBox="0 0 24 24"
                      fill="none">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#ffcc00"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 12L10 15L17 8"
                        stroke="#ffcc00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-white ml-1 text-2xl">SOL</span>
                  </div>
                  <p className="text-gray-400">per month</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>1 AI Agent</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>1,000 API Calls</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Basic Verification</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg
                      className="h-5 w-5 mr-2 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Advanced Analytics</span>
                  </li>
                </ul>

                <motion.button
                  className="w-full bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold py-3 rounded-lg transition-all text-lg mt-auto"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(255,49,49,0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}>
                  Get Started
                </motion.button>
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              className="relative md:scale-110 z-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}>
              {/* Chinese-styled border with SVG - more elaborate for featured plan */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 550"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M30,10 H370 C380,10 390,20 390,30 V520 C390,530 380,540 370,540 H30 C20,540 10,530 10,520 V30 C10,20 20,10 30,10 Z"
                  stroke="url(#goldRedGradient)"
                  strokeWidth="4"
                />
                <path
                  d="M40,20 H360 C370,20 380,30 380,40 V510 C380,520 370,530 360,530 H40 C30,530 20,520 20,510 V40 C20,30 30,20 40,20 Z"
                  stroke="#ff3131"
                  strokeWidth="2"
                />

                {/* Chinese knot patterns */}
                <path
                  d="M200,20 Q220,40 200,60 T200,100 T200,140"
                  stroke="#ffcc00"
                  strokeWidth="2"
                />
                <path
                  d="M200,390 Q220,410 200,430 T200,470 T200,510"
                  stroke="#ffcc00"
                  strokeWidth="2"
                />

                {/* Corner decorations */}
                <path
                  d="M40,40 Q60,20 80,40"
                  stroke="#ff3131"
                  strokeWidth="2"
                />
                <path
                  d="M320,40 Q340,20 360,40"
                  stroke="#ff3131"
                  strokeWidth="2"
                />
                <path
                  d="M40,510 Q60,530 80,510"
                  stroke="#ff3131"
                  strokeWidth="2"
                />
                <path
                  d="M320,510 Q340,530 360,510"
                  stroke="#ff3131"
                  strokeWidth="2"
                />

                {/* Dragon silhouettes */}
                <path
                  d="M30,100 Q50,90 70,100 T110,110 T150,90 T190,100"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  opacity="0.7"
                />
                <path
                  d="M210,100 Q230,90 250,100 T290,110 T330,90 T370,100"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  opacity="0.7"
                />
                <path
                  d="M30,450 Q50,440 70,450 T110,460 T150,440 T190,450"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  opacity="0.7"
                />
                <path
                  d="M210,450 Q230,440 250,450 T290,460 T330,440 T370,450"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  opacity="0.7"
                />

                <circle cx="50" cy="50" r="10" fill="#ff3131" />
                <circle cx="350" cy="50" r="10" fill="#ff3131" />
                <circle cx="50" cy="500" r="10" fill="#ff3131" />
                <circle cx="350" cy="500" r="10" fill="#ff3131" />

                <defs>
                  <linearGradient
                    id="goldRedGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#ff3131" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Popular badge */}
              <div className="absolute -top-5 -right-5 bg-[#ff3131] text-white text-xs font-bold px-3 py-1 rounded-full z-20 transform rotate-12 shadow-lg">
                POPULAR
              </div>

              <div className="p-8 pt-16 backdrop-blur-sm bg-black/40 h-full flex flex-col">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-10 py-3 border-2 border-[#ffcc00] rounded-full shadow-[0_0_15px_rgba(255,204,0,0.5)]">
                  <h3 className="text-2xl font-bold text-[#ffcc00]">
                    Professional
                  </h3>
                </div>

                <div className="mb-8 text-center">
                  <div className="text-5xl font-bold mb-2 flex items-center justify-center">
                    <span className="text-[#ffcc00]">2.5</span>
                    <svg
                      className="h-7 w-7 ml-2"
                      viewBox="0 0 24 24"
                      fill="none">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#ffcc00"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 12L10 15L17 8"
                        stroke="#ffcc00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-white ml-1 text-3xl">SOL</span>
                  </div>
                  <p className="text-gray-300">per month</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center">
                    <svg
                      className="h-6 w-6 mr-2 text-[#ff3131]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">5 AI Agents</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-6 w-6 mr-2 text-[#ff3131]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">10,000 API Calls</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-6 w-6 mr-2 text-[#ff3131]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Advanced Verification</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-6 w-6 mr-2 text-[#ff3131]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Basic Analytics</span>
                  </li>
                </ul>

                <motion.button
                  className="w-full bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold py-4 rounded-lg transition-all text-lg mt-auto shadow-[0_0_20px_rgba(255,49,49,0.3)]"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(255,49,49,0.6)",
                  }}
                  whileTap={{ scale: 0.98 }}>
                  Choose Plan
                </motion.button>
              </div>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}>
              {/* Chinese-styled border with SVG */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M30,10 H370 C380,10 390,20 390,30 V470 C390,480 380,490 370,490 H30 C20,490 10,480 10,470 V30 C10,20 20,10 30,10 Z"
                  stroke="url(#goldGradient2)"
                  strokeWidth="3"
                />
                <path
                  d="M40,20 H360 C370,20 380,30 380,40 V460 C380,470 370,480 360,480 H40 C30,480 20,470 20,460 V40 C20,30 30,20 40,20 Z"
                  stroke="#ff3131"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />

                {/* Chinese coin symbol in corners */}
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  fill="none"
                />
                <rect x="45" y="45" width="10" height="10" fill="#ffcc00" />
                <circle
                  cx="350"
                  cy="50"
                  r="20"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  fill="none"
                />
                <rect x="345" y="45" width="10" height="10" fill="#ffcc00" />
                <circle
                  cx="50"
                  cy="450"
                  r="20"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  fill="none"
                />
                <rect x="45" y="445" width="10" height="10" fill="#ffcc00" />
                <circle
                  cx="350"
                  cy="450"
                  r="20"
                  stroke="#ffcc00"
                  strokeWidth="2"
                  fill="none"
                />
                <rect x="345" y="445" width="10" height="10" fill="#ffcc00" />

                {/* Decorative patterns */}
                <path
                  d="M100,20 Q125,50 150,20"
                  stroke="#ff3131"
                  strokeWidth="2"
                />
                <path
                  d="M250,20 Q275,50 300,20"
                  stroke="#ff3131"
                  strokeWidth="2"
                />
                <path
                  d="M100,480 Q125,450 150,480"
                  stroke="#ff3131"
                  strokeWidth="2"
                />
                <path
                  d="M250,480 Q275,450 300,480"
                  stroke="#ff3131"
                  strokeWidth="2"
                />

                <defs>
                  <linearGradient
                    id="goldGradient2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="p-8 pt-14 backdrop-blur-sm bg-black/30 h-full flex flex-col">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-8 py-2 border-2 border-[#ffcc00] rounded-full">
                  <h3 className="text-xl font-bold text-[#ffcc00]">
                    Enterprise
                  </h3>
                </div>

                <div className="mb-6 text-center">
                  <div className="text-4xl font-bold mb-2 flex items-center justify-center">
                    <span className="text-[#ffcc00]">8</span>
                    <svg
                      className="h-6 w-6 ml-2"
                      viewBox="0 0 24 24"
                      fill="none">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#ffcc00"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 12L10 15L17 8"
                        stroke="#ffcc00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-white ml-1 text-2xl">SOL</span>
                  </div>
                  <p className="text-gray-400">per month</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Unlimited AI Agents</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>100,000 API Calls</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Premium Verification</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#ffcc00]"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>24/7 Support</span>
                  </li>
                </ul>

                <motion.button
                  className="w-full border-2 border-[#ffcc00] hover:bg-[#ffcc00]/10 py-3 rounded-lg transition-all text-lg mt-auto"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(255,204,0,0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}>
                  Contact Sales
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Pay-per-use option */}
          <motion.div
            className="mt-16 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}>
            <div className="relative inline-block">
              <div className="absolute inset-0 border-2 border-[#ff3131] rounded-full blur-sm"></div>
              <div className="absolute inset-0 border-2 border-[#ffcc00] rounded-full rotate-45 blur-sm"></div>
              <div className="relative bg-black/50 backdrop-blur-sm py-6 px-12 rounded-xl border-2 border-[#ffcc00] shadow-[0_0_25px_rgba(255,204,0,0.2)]">
                <h3 className="text-2xl font-bold mb-4">Pay As You Go</h3>
                <p className="mb-2">Only pay for what you use</p>
                <div className="flex justify-center items-center gap-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">0.001</div>
                    <div className="text-sm text-gray-400">
                      SOL per API call
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0.01</div>
                    <div className="text-sm text-gray-400">
                      SOL per verification
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">0.05</div>
                    <div className="text-sm text-gray-400">
                      SOL per agent/day
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Chinese coins */}
        <motion.div
          className="absolute -bottom-10 left-20 w-20 h-20 opacity-40 pointer-events-none"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#ffcc00" opacity="0.8" />
            <circle cx="50" cy="50" r="35" fill="black" />
            <rect x="43" y="25" width="14" height="50" fill="#ffcc00" />
            <rect x="25" y="43" width="50" height="14" fill="#ffcc00" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute -bottom-5 right-40 w-16 h-16 opacity-30 pointer-events-none"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}>
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#ffcc00" opacity="0.8" />
            <circle cx="50" cy="50" r="35" fill="black" />
            <rect x="43" y="25" width="14" height="50" fill="#ffcc00" />
            <rect x="25" y="43" width="50" height="14" fill="#ffcc00" />
          </svg>
        </motion.div>
      </section>

      {/* CTA with Bamboo background - updated with new bamboo image */}
      <section
        ref={(el) => (sections.current[1] = el)}
        className="py-20 px-6 relative min-h-screen flex items-center">
        {/* Bamboo illustration with parallax */}
        <motion.div
          className="absolute right-0 bottom-0 h-full w-60 opacity-40 pointer-events-none"
          style={{
            x: useTransform(scrollYProgress, [0.6, 0.9], [100, -50]),
            y: parallaxReverse,
          }}>
          <Image
            src="https://png.pngtree.com/png-clipart/20220117/original/pngtree-ink-painting-chinese-style-traditional-chinese-painting-bamboo-green-bamboo-ancient-png-image_7135341.png"
            alt="Bamboo illustration"
            fill
            objectFit="contain"
            objectPosition="right bottom"
          />
        </motion.div>

        {/* Additional bamboo on left side */}
        <motion.div
          className="absolute left-0 bottom-0 h-full w-40 opacity-30 pointer-events-none"
          style={{
            x: useTransform(scrollYProgress, [0.6, 0.9], [-50, 30]),
            y: parallaxSlow,
          }}>
          <Image
            src="https://png.pngtree.com/png-clipart/20220117/original/pngtree-ink-painting-chinese-style-traditional-chinese-painting-bamboo-green-bamboo-ancient-png-image_7135341.png"
            alt="Bamboo illustration"
            fill
            objectFit="contain"
            objectPosition="left bottom"
          />
        </motion.div>

        <div className="container mx-auto text-center relative z-10">
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6 text-glow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}>
            Ready to build your AI agent?
          </motion.h2>
          <motion.p
            className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}>
            Get started with Dumpling today and create powerful AI agents that
            leverage the security and transparency of blockchain.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}>
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-[#ff3131] to-[#ffcc00] hover:opacity-90 text-black font-bold py-4 px-12 rounded-lg transition-all text-lg">
                Launch App
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer with Chinese-inspired wave pattern */}
      <footer className="py-10 px-6 bg-background relative">
        {/* Wave pattern background */}
        <div className="absolute inset-0 bg-[url('/chinese-wave.png')] bg-repeat-x bg-bottom opacity-10 pointer-events-none" />

        <div className="container mx-auto">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Dumpling. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
