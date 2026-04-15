import Link from 'next/link';
import { useState } from 'react';

export default function Header({ user, credits }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">IMA-GEN</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/generate" className="text-gray-400 hover:text-white transition-colors font-medium">
              Generate
            </Link>
            <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors font-medium">
              Gallery
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors font-medium">
              Pricing
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-800 rounded-lg border border-gray-600">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-bold text-white">{credits}</span>
                  <span className="text-gray-400 text-sm font-medium">credits</span>
                </div>
                <Link href="/checkout">
                  <button className="btn-primary text-sm font-semibold">Buy Credits</button>
                </Link>
                <Link href="/logout">
                  <button className="btn-secondary text-sm font-medium">Logout</button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="btn-secondary text-sm font-medium">Login</button>
                </Link>
                <Link href="/register">
                  <button className="btn-primary text-sm font-semibold">Sign Up</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-700">
            <div className="flex flex-col gap-4">
              <Link href="/generate" className="text-gray-400 hover:text-white transition-colors py-3 px-4 hover:bg-gray-800 rounded-lg font-medium">
                Generate
              </Link>
              <Link href="/gallery" className="text-gray-400 hover:text-white transition-colors py-3 px-4 hover:bg-gray-800 rounded-lg font-medium">
                Gallery
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors py-3 px-4 hover:bg-gray-800 rounded-lg font-medium">
                Pricing
              </Link>

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-5 py-3 bg-gray-800 rounded-lg border border-gray-600">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-bold text-white">{credits}</span>
                    <span className="text-gray-400 text-sm font-medium">credits</span>
                  </div>
                  <Link href="/checkout">
                    <button className="btn-primary w-full text-sm font-semibold">Buy Credits</button>
                  </Link>
                  <Link href="/logout">
                    <button className="btn-secondary w-full text-sm font-medium">Logout</button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <button className="btn-secondary w-full text-sm font-medium">Login</button>
                  </Link>
                  <Link href="/register">
                    <button className="btn-primary w-full text-sm font-semibold">Sign Up</button>
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
