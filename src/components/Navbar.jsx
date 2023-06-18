import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full h-16 bg-[#1d1e20] flex items-center justify-center shadow-sm mb-10">
      <a href="/" className="text-2xl font-bold tracking-tight text-white">
        Aqua<span className="text-teal-500">Graph</span>
      </a>
    </nav>
  );
};

export default Navbar;
