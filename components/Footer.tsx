"use client";

import clsx from "clsx";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className={clsx("bg-gray-100 py-4", "border-t border-gray-200")}>
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Quizeen Quiz taker. All rights reserved.</p>
        <p>
          Built with{" "}
          <a
            href="https://nextjs.org"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js
          </a>{" "}
          and{" "}
          <a
            href="https://tailwindcss.com"
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tailwind CSS
          </a>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
