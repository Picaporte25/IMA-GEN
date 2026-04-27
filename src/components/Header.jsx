import Link from 'next/link';
import { useState } from 'react';

export default function Header({ user, credits }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center header-height-custom">
          {/* Logo - Smaller (15% smaller) and far left */}
          <div className="flex-shrink-0">
            <Link href="/" className="hover:opacity-80 transition-opacity duration-200 flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center">
                <img src="/logo.svg" alt="PixelAlchemy Logo" className="w-7 h-7" />
              </div>
              <span className="text-lg font-bold text-white">PixelAlchemy</span>
            </Link>
          </div>

          {/* Spacer to push navigation center */}
          <div className="flex-grow"></div>

          {/* Desktop Navigation - Centered (15% larger) */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-all duration-200 text-base font-medium">
              Home
            </Link>
            <Link href={user ? "/#generator" : "/register?redirect=generator"} className="text-gray-400 hover:text-white transition-all duration-200 text-base font-medium">
              Create
            </Link>
            <Link href="/gallery" className="text-gray-400 hover:text-white transition-all duration-200 text-base font-medium">
              Gallery
            </Link>
            {user && (
              <Link href="/history" className="text-gray-400 hover:text-white transition-all duration-200 text-base font-medium">
                History
              </Link>
            )}
          </div>

          {/* Spacer to push user actions to the right */}
          <div className="flex-grow"></div>

          {/* User Actions - Far right (15% larger) */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-600">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-bold text-white text-base">{credits}</span>
                  <span className="text-gray-400 text-sm">credits</span>
                </div>
                <Link href="/checkout" className="btn-secondary btn-header-secondary">
                  Buy
                </Link>
                <a href="/logout" className="text-gray-400 hover:text-white transition-all duration-200 text-sm font-medium cursor-pointer">
                  Logout
                </a>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-400 hover:text-white transition-all duration-200 text-sm font-medium">
                  Login
                </Link>
                <Link href="/register?redirect=generator" className="btn-primary btn-header-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Compact */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden ml-2 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu - Simplified */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700 animate-slideDown">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-all duration-200 py-2 px-4 hover:bg-gray-800 rounded-lg text-sm font-medium">
                Home
              </Link>
              <Link href={user ? "/#generator" : "/register?redirect=generator"} className="text-gray-400 hover:text-white transition-all duration-200 py-2 px-4 hover:bg-gray-800 rounded-lg text-sm font-medium">
                Create
              </Link>
              <Link href="/edit" className="text-gray-400 hover:text-white transition-all duration-200 py-2 px-4 hover:bg-gray-800 rounded-lg text-sm font-medium">
                Edit
              </Link>
              <Link href="/gallery" className="text-gray-400 hover:text-white transition-all duration-200 py-2 px-4 hover:bg-gray-800 rounded-lg text-sm font-medium">
                Gallery
              </Link>
              {user && (
                <Link href="/history" className="text-gray-400 hover:text-white transition-all duration-200 py-2 px-4 hover:bg-gray-800 rounded-lg text-sm font-medium">
                  History
                </Link>
              )}

              {user && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-600">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-bold text-white text-sm">{credits}</span>
                    <span className="text-gray-400 text-xs">credits</span>
                  </div>
                  <Link href="/checkout">
                    <button className="btn-secondary w-full text-sm font-medium py-2">Buy Credits</button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white w-full text-sm font-medium py-2"
                  >
                    Logout
                  </button>
                </>
              )}

              {!user && (
                <>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-all duration-200 py-2 px-4 hover:bg-gray-800 rounded-lg text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/register?redirect=generator" className="btn-primary w-full text-sm font-semibold py-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
