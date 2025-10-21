import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))'
				},
				'admin-red': {
					DEFAULT: 'hsl(var(--admin-red))',
					foreground: 'hsl(var(--admin-red-foreground))',
					hover: 'hsl(var(--admin-red-hover))'
				},
				'admin-blue': {
					DEFAULT: 'hsl(var(--admin-blue))',
					foreground: 'hsl(var(--admin-blue-foreground))',
					hover: 'hsl(var(--admin-blue-hover))'
				},
				'employee-legal': {
					DEFAULT: 'hsl(var(--employee-legal))',
					foreground: 'hsl(var(--employee-legal-foreground))',
					hover: 'hsl(var(--employee-legal-hover))'
				},
				'bank-navy': {
					DEFAULT: 'hsl(var(--bank-navy))',
					foreground: 'hsl(var(--bank-navy-foreground))',
					hover: 'hsl(var(--bank-navy-hover))'
				},
				'bank-success': {
					DEFAULT: 'hsl(var(--bank-success))',
					foreground: 'hsl(var(--bank-success-foreground))'
				},
				'bank-warning': {
					DEFAULT: 'hsl(var(--bank-warning))',
					foreground: 'hsl(var(--bank-warning-foreground))'
				},
				'justice-gold': 'hsl(var(--justice-gold))',
				'legal-deep-blue': 'hsl(var(--legal-deep-blue))',
				'court-purple': 'hsl(var(--court-purple))',
				'law-emerald': 'hsl(var(--law-emerald))',
				'prestige-amber': 'hsl(var(--prestige-amber))',
				'corporate-blue': {
					DEFAULT: 'hsl(var(--corporate-blue))',
					foreground: 'hsl(var(--corporate-blue-foreground))'
				},
				'corporate-teal': {
					DEFAULT: 'hsl(var(--corporate-teal))',
					foreground: 'hsl(var(--corporate-teal-foreground))'
				},
				'dashboard': {
					bg: 'hsl(var(--dashboard-bg))',
					card: 'hsl(var(--dashboard-card))',
					'card-hover': 'hsl(var(--dashboard-card-hover))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			fontFamily: {
				'sans': ['Poppins', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-justice': 'var(--gradient-justice)',
				'gradient-law-firm': 'var(--gradient-law-firm)',
				'gradient-prestige': 'var(--gradient-prestige)',
				'gradient-legal-bg': 'var(--gradient-legal-bg)',
				'gradient-employee-light': 'var(--gradient-employee-light)',
				'gradient-employee-rich': 'var(--gradient-employee-rich)',
				'gradient-bank-light': 'var(--gradient-bank-light)',
				'gradient-bank-rich': 'var(--gradient-bank-rich)',
				'gradient-corporate': 'var(--gradient-corporate)',
				'gradient-dashboard': 'var(--gradient-dashboard)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'card': 'var(--shadow-card)',
				'glow': 'var(--shadow-glow)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
