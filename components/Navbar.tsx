"use client";

import { useAppSelector } from "@/lib/hooks";
import clsx from "clsx";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAppSelector(s => s.auth.user)

  
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className={clsx("bg-white shadow-md", "px-4 py-2","sticky top-0")}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold text-gray-800">
          Quizeen
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
        {
          user&&user.role==="admin"&&
          <Link href={"/new"}>
          <Button>Create New Quiz</Button></Link>
        }
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            Home
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-800">
            About
          </Link>
          <Link href="/results" className="text-gray-600 hover:text-gray-800">
            Results
          </Link>
          
          {user?<Link href="/account" className="text-gray-600 hover:text-gray-800">
            Account
          </Link>:<Link href="/auth/login" className="bg-gradient-to-br from-neutral-800 to-neutral-500 duration-300 hover:bg-gradient-to-l hover:scale-105 text-white px-3 py-1 rounded-md">
            Sign in
          </Link>}
        </div>
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <svg
            className="w-6 h-6 duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                className="duration-300"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                className="duration-300"
                d="M4 8h16M4 16h16"
              />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-4 duration-200">
          {
          user&&user.role==="admin"&&
          <Link href={"/new"} className="block w-full">
          <Button className="w-full">Create New Quiz</Button></Link>
        }
          <Link href="/home" className="block py-2 text-gray-600 hover:text-gray-800">
            Home
          </Link>
          <Link href="/about" className="block py-2 text-gray-600 hover:text-gray-800">
            About
          </Link>
          <Link href="/results" className="block py-2 text-gray-600 hover:text-gray-800">
            Result
          </Link>
          {
            user?<Link href="/account" className="block py-2 text-gray-600 hover:text-gray-800">
            Account
          </Link>:<Link href="/auth/login" className="block py-2 px-3 rounded-md bg-neutral-800 text-white">
            Sign in
          </Link>
          }
        </div>
      )}
    </nav>
  );
};

export default Navbar;
