/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#141414',
        'bg-card': '#1a1a1a',

        // Accent Colors - Orange
        'accent-orange': '#FF6B00',
        'accent-orange-light': '#FF8C00',

        // Accent Colors - Violet
        'accent-violet': '#8B5CF6',
        'accent-violet-light': '#A78BFA',
        'accent-violet-dark': '#7C3AED',

        // Text Colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',

        // Border Colors
        'border-default': '#333333',
        'border-accent': 'rgba(255, 107, 0, 0.5)',

        // Status Colors
        'status-success': '#22C55E',
        'status-error': '#EF4444',
        'status-warning': '#F59E0B',
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(255, 107, 0, 0.5)',
        'neon-violet': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'gradient-xy': 'gradient-xy 3s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'particle': 'particle 15s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            filter: 'brightness(1)'
          },
          '50%': {
            opacity: '0.8',
            filter: 'brightness(1.2)'
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          },
        },
        'particle': {
          '0%': {
            transform: 'translateY(100vh) rotate(0deg)',
            opacity: '0'
          },
          '10%': {
            opacity: '1'
          },
          '90%': {
            opacity: '1'
          },
          '100%': {
            transform: 'translateY(-100vh) rotate(720deg)',
            opacity: '0'
          },
        },
      },
      backgroundImage: {
        'gradient-futuristic': 'linear-gradient(135deg, #FF6B00 0%, #8B5CF6 50%, #FFFFFF 100%)',
        'gradient-orange-violet': 'linear-gradient(135deg, #FF6B00 0%, #8B5CF6 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
    },
  },
  plugins: [],
}
