/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neumorphic surface system (dark)
        base: '#1b212c',
        surface: '#1f2733',
        sunken: '#161b24',
        // Single brand accent + low-sat semantic tints
        accent: {
          DEFAULT: '#4cc9f0',
          soft: '#5fd3f5',
          deep: '#2a93c4',
        },
        ink: {
          DEFAULT: '#e8eef7',
          soft: '#9fb0c6',
          faint: '#647082',
        },
        // Domain tints (kept low saturation for cohesion)
        energy: '#f5b14c',
        sleep: '#9d7be8',
        water: '#4cc9f0',
        nutri: '#5fd38a',
        air: '#7fd1e8',
        sport: '#ef6f6f',
        fizz: '#f5d04c',
        shadow: '#ef6f6f',
        soul: '#9d7be8',
        success: '#5fd38a',
        warning: '#f5b14c',
      },
      boxShadow: {
        // raised neumorphic
        neo: '7px 7px 16px #11151c, -7px -7px 16px #252f3e',
        'neo-sm': '4px 4px 9px #11151c, -4px -4px 9px #252f3e',
        'neo-lg': '12px 12px 28px #0e1218, -12px -12px 28px #283342',
        // pressed / inset
        'neo-inset': 'inset 5px 5px 11px #11151c, inset -5px -5px 11px #252f3e',
        'neo-inset-sm': 'inset 3px 3px 6px #11151c, inset -3px -3px 6px #252f3e',
        // glowing accent
        'neo-accent': '6px 6px 14px #11151c, -6px -6px 14px #252f3e, 0 0 18px -2px rgba(76,201,240,0.45)',
      },
      borderRadius: {
        neo: '22px',
        'neo-lg': '30px',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['"Space Grotesk"', 'Manrope', 'sans-serif'],
      },
      keyframes: {
        'pulse-soft': {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
