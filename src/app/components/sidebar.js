"use client";
import Link from 'next/link';

export default function Sidebar({ activePage }) {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/agent-builder", label: "AI Agent Builder" },
    { path: "/api-keys", label: "API Keys & Embed" },
    { path: "/billing", label: "Billing" },
  ];

  return (
    <div className="z-50 w-64 bg-[#0a0a0a] border-r border-gray-800 p-4 hidden md:block">
      <div className="space-y-4">
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            href={item.path} 
            className={`block py-2 px-4 ${
              activePage === item.path 
                ? "bg-[#1a1a1a] rounded-md text-[#ff3131] font-medium" 
                : "hover:bg-[#1a1a1a] rounded-md transition-colors"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}