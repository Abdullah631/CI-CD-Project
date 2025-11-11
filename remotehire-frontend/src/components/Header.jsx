import React from "react";
import { LogoIcon, SunIcon } from "./Icons";

export const Header = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <a href="/#" className="flex items-center space-x-2">
            <LogoIcon />
            <span className="font-bold text-xl text-gray-800">
              RemoteHire.io
            </span>
          </a>
          <nav className="hidden md:flex space-x-8">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Features
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              How It Works
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Pricing
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button
            aria-label="Toggle theme"
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <SunIcon />
          </button>
          <a
            href="/#/signin"
            className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2"
          >
            Sign in
          </a>
          <a
            href="/#/signup"
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  </header>
);
