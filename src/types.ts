export interface Prompt {
  id: string;
  title: string;
  description: string;
  fullPrompt: string;
  price: string;
  category: 'Admin Panel' | 'Games' | 'E-commerce' | 'Tools';
  features: string[];
  tools: string[];
  image: string;
  isFree?: boolean;
  createdAt?: any;
}

export type Category = Prompt['category'] | 'All';

export const PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Advanced SaaS Dashboard',
    description: 'A complete React + Tailwind dashboard with dark mode and analytics charts.',
    fullPrompt: 'Create a highly polished SaaS dashboard using React, Tailwind CSS, and Recharts. Include a sidebar with navigation, a top header with search and user profile, and a main content area with stats cards, a line chart for revenue, and a table for recent transactions. Ensure full responsiveness and a premium dark theme.',
    price: '$29',
    category: 'Admin Panel',
    features: ['Dark Mode Support', 'Interactive Charts', 'Responsive Tables'],
    tools: ['React', 'Tailwind', 'Recharts'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Retro Platformer Game',
    description: 'The foundation for a pixel-perfect 2D platformer with physics.',
    fullPrompt: 'Generate a 2D platformer game engine using Phaser.js. Include player movement (jump, run), collision detection with platforms, a camera follow system, and simple enemy AI. Use a retro 16-bit aesthetic for the UI and assets.',
    price: '$19',
    category: 'Games',
    features: ['Physics Engine', 'Enemy AI', 'Camera Systems'],
    tools: ['HTML5 Canvas', 'Phaser.js', 'WebAudio API'],
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'E-commerce Storefront',
    description: 'Modern mobile-first boutique store with cart logic.',
    fullPrompt: 'Build a premium e-commerce storefront using Vite and React. Focus on smooth transitions, a glassmorphic navbar, a search filter for products, and a persistent slide-out cart. Use framer-motion for product card entry animations.',
    price: '$39',
    category: 'E-commerce',
    features: ['Shopping Cart', 'Product Filtering', 'Smooth Transitions'],
    tools: ['React', 'Framer Motion', 'Zustand'],
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'AI Image Customizer',
    description: 'Tool for editing images using generative AI prompts.',
    fullPrompt: 'Develop a tool that integrates with the Gemini API to analyze images and suggest edits. Include a canvas for visual feedback and a prompt input field that sends text to a backend for image manipulation instructions.',
    price: '$49',
    category: 'Tools',
    features: ['AI Integration', 'Canvas API', 'Real-time Analysis'],
    tools: ['Gemini API', 'Node.js', 'Canvas'],
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800'
  }
];
