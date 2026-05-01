import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home as HomeIcon, LayoutGrid, User, Search, MessageSquare, ShoppingBag, Menu, X, Copy, Check, ExternalLink, Sliders, Gamepad2, ShoppingCart, Briefcase, ChevronRight, Globe, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { PROMPTS as STATIC_PROMPTS, Prompt, Category } from './types';
import { auth, loginWithGoogle, logout, subscribePrompts, uploadPrompt, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ user, onOpenAuth }: { user: FirebaseUser | null, onOpenAuth: () => void }) => {
  const navigate = useNavigate();
  const isAdmin = user?.email === 'kuldippushpad1@gmail.com';

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b-0 px-6 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
          <Globe className="text-white w-6 h-6" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
          Idea2App <span className="gradient-text">Prompt</span>
        </span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 font-medium">
        <button onClick={() => navigate('/')} className="hover:text-brand-primary transition-colors text-sm uppercase tracking-wider font-bold">Home</button>
        <button onClick={() => navigate('/listing')} className="hover:text-brand-primary transition-colors text-sm uppercase tracking-wider font-bold">Prompts</button>
        {isAdmin && (
           <button onClick={() => navigate('/admin')} className="text-brand-secondary hover:text-white transition-colors text-sm uppercase tracking-wider font-bold">Admin</button>
        )}
        <button onClick={() => navigate('/contact')} className="hover:text-brand-primary transition-colors text-sm uppercase tracking-wider font-bold">Contact</button>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
             <div 
               className="w-10 h-10 rounded-full border-2 border-brand-primary p-0.5 cursor-pointer"
               onClick={() => navigate('/dashboard')}
             >
                <img src={user.photoURL || ''} alt="User" className="w-full h-full rounded-full object-cover" />
             </div>
             <button onClick={logout} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Logout</button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="btn-outline py-2 px-6 hidden sm:block"
          >
            Login
          </button>
        )}
        <button 
          onClick={() => navigate('/listing')}
          className="btn-primary py-2 px-6"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full glass border-t border-slate-700/50 z-50 flex items-center justify-around py-3 rounded-t-2xl">
      <button 
        onClick={() => navigate('/')}
        className={cn("flex flex-col items-center gap-1 transition-colors", isActive('/') ? "text-brand-primary" : "text-slate-400")}
      >
        <HomeIcon size={24} />
        <span className="text-[10px] font-medium">Home</span>
      </button>
      <button 
        onClick={() => navigate('/listing')}
        className={cn("flex flex-col items-center gap-1 transition-colors", isActive('/listing') ? "text-brand-primary" : "text-slate-400")}
      >
        <LayoutGrid size={24} />
        <span className="text-[10px] font-medium">Browse</span>
      </button>
      <button 
        onClick={() => navigate('/dashboard')}
        className={cn("flex flex-col items-center gap-1 transition-colors", isActive('/dashboard') ? "text-brand-primary" : "text-slate-400")}
      >
        <User size={24} />
        <span className="text-[10px] font-medium">Account</span>
      </button>
    </div>
  );
};

const PromptCard = ({ prompt, onClick }: { prompt: Prompt, onClick: () => void }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="glass rounded-3xl overflow-hidden group border border-slate-700/30 hover:border-brand-primary/50 transition-colors"
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={prompt.image} 
          alt={prompt.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-xs font-bold ring-1 ring-slate-700/50">
          {prompt.category}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-semibold text-lg">{prompt.title}</h3>
          <span className="gradient-text font-bold text-lg">{prompt.price}</span>
        </div>
        <p className="text-slate-400 text-sm line-clamp-2 mb-6">
          {prompt.description}
        </p>
        <button 
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 transition-colors font-medium border border-slate-700/50"
        >
          View Details <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// --- Pages ---

const Home = ({ prompts }: { prompts: Prompt[] }) => {
  const navigate = useNavigate();
  const displayPrompts = prompts.length > 0 ? prompts : STATIC_PROMPTS;
  
  return (
    <div className="pt-32 pb-24 md:pb-32 px-6 max-w-7xl mx-auto space-y-32">
      {/* Hero */}
      <section className="relative flex flex-col items-center text-center space-y-8">
        <div className="absolute -top-40 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-semibold text-brand-primary border-brand-primary/20">
            <TrendingUp size={16} />
            <span>Powering 1,000+ App Ideas</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] max-w-5xl">
            Turn Your Ideas Into <br /> <span className="gradient-text">Apps Instantly</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Buy Ready-Made AI Prompts for Web Apps, Games, and Admin Panels. Skip months of development and go live today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/listing')}
              className="btn-primary w-full sm:w-auto px-10 py-4 text-lg"
            >
              Browse Prompts
            </button>
            <button 
              onClick={() => navigate('/listing')}
              className="btn-outline w-full sm:w-auto px-10 py-4 text-lg"
            >
              Start Building
            </button>
          </div>
        </motion.div>
      </section>

      {/* Featured Secton */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h2 className="font-display font-bold text-3xl md:text-4xl">Featured Prompts</h2>
            <p className="text-slate-400 max-w-md">Our most popular and highly rated prompts hand-picked for quality.</p>
          </div>
          <button 
            onClick={() => navigate('/listing')}
            className="text-brand-primary font-semibold flex items-center gap-1 hover:underline"
          >
            All Prompts <ExternalLink size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPrompts.slice(0, 3).map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} onClick={() => navigate(`/prompt/${prompt.id}`)} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl">Browse Categories</h2>
          <p className="text-slate-400">Everything you need to launch your next project.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { icon: Briefcase, label: 'Admin Panels', color: 'bg-blue-500' },
            { icon: Gamepad2, label: 'Games', color: 'bg-purple-500' },
            { icon: ShoppingCart, label: 'E-commerce', color: 'bg-pink-500' },
            { icon: Sliders, label: 'Tools', color: 'bg-orange-500' },
          ].map((cat, i) => (
            <div key={i} className="glass group hover:bg-slate-800/80 transition-all p-8 rounded-[40px] flex flex-col items-center gap-4 cursor-pointer">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", cat.color)}>
                <cat.icon className="text-white w-8 h-8" />
              </div>
              <span className="font-display font-semibold text-lg">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto space-y-12 py-12">
         <div className="text-center space-y-4">
          <h2 className="font-display font-bold text-3xl md:text-4xl">FAQ</h2>
          <p className="text-slate-400">Common questions about Idea2App prompts.</p>
        </div>
        <div className="space-y-4">
          {[
            { q: "How do I use these prompts?", a: "Simply copy the prompt and paste it into your favorite AI tool like Gemini, Claude, or ChatGPT. It will generate the code and structure for you." },
            { q: "Are the prompts reusable?", a: "Yes, infinitely! You can tweak them, share them, or build multiple projects from a single prompt purchase." },
            { q: "Do you offer refunds?", a: "Due to the digital nature of prompts, we don't offer refunds, but we guarantee the quality of our output structure." },
          ].map((faq, i) => (
            <div key={i} className="glass p-6 rounded-3xl space-y-2 border-slate-800">
              <h4 className="font-display font-bold text-lg">{faq.q}</h4>
              <p className="text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Listing = ({ prompts }: { prompts: Prompt[] }) => {
  const [filter, setFilter] = React.useState<Category>('All');
  const [search, setSearch] = React.useState('');
  const navigate = useNavigate();

  const activePrompts = prompts.length > 0 ? prompts : STATIC_PROMPTS;

  const filtered = activePrompts.filter(p => 
    (filter === 'All' || p.category === filter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pt-32 pb-24 md:pb-32 px-6 max-w-7xl mx-auto space-y-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="font-display font-bold text-4xl md:text-5xl">Library</h1>
            <p className="text-slate-400">Discover prompts built for performance and modern UI.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass bg-slate-900/50 rounded-2xl py-4 pl-12 pr-6 border-slate-700/50 focus:border-brand-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Admin Panel', 'Games', 'E-commerce', 'Tools'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as Category)}
              className={cn(
                "px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all",
                filter === cat ? "bg-brand-primary text-white" : "glass border-slate-700/50 text-slate-400 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filtered.map(prompt => (
          <motion.div 
            key={prompt.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <PromptCard prompt={prompt} onClick={() => navigate(`/prompt/${prompt.id}`)} />
          </motion.div>
        ))}
      </motion.div>
      
      {filtered.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold">No prompts found</h3>
          <p className="text-slate-400">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};

const PromptDetails = () => {
  const { id } = useNavigate() as any; // This won't work in real React Router but I'll fix it in App
  // I'll handle prompt retrieval in the main App component via URL params
  return null;
};

const Dashboard = ({ user, onCopy }: { user: FirebaseUser | null, onCopy: (msg: string) => void }) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!user) {
    return (
      <div className="pt-40 text-center space-y-4">
        <h2 className="text-2xl font-bold">Please login to view your dashboard</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
      </div>
    );
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onCopy('Prompt copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pt-32 pb-24 md:pb-32 px-6 max-w-7xl mx-auto space-y-12">
      <div className="glass p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-1">
             <div className="w-full h-full rounded-full bg-bg-dark flex items-center justify-center overflow-hidden">
                <img src={user.photoURL || ''} alt="Profile" className="w-full h-full object-cover" />
             </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.displayName?.split(' ')[0]}</h1>
            <p className="text-slate-400">Manage your purchased prompts and ideas.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center px-6">
            <span className="block text-2xl font-bold">4</span>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Prompts</span>
          </div>
          <div className="h-12 w-[1px] bg-slate-800" />
          <div className="text-center px-6">
            <span className="block text-2xl font-bold">$126</span>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Spent</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <ShoppingBag className="text-brand-primary" />
          Purchased Prompts
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          {STATIC_PROMPTS.slice(0, 2).map((p) => (
            <div key={p.id} className="glass p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 group">
              <div className="w-full md:w-48 aspect-video rounded-2xl overflow-hidden shrink-0">
                <img src={p.image} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <p className="text-slate-400 text-sm">{p.category} • Purchased on May 1, 2026</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleCopy(p.id, p.fullPrompt)}
                    className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                  >
                    {copiedId === p.id ? <Check size={16} /> : <Copy size={16} />}
                    {copiedId === p.id ? 'Copied!' : 'Copy Prompt'}
                  </button>
                  <button 
                    onClick={() => navigate(`/prompt/${p.id}`)}
                    className="btn-outline py-2 px-6 text-sm flex items-center gap-2"
                  >
                    Instruction PDF <div className="text-[10px] bg-slate-800 px-1 rounded">PRO</div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ user, onCopy }: { user: FirebaseUser | null, onCopy: (msg: string) => void }) => {
  const navigate = useNavigate();
  const isAdmin = user?.email === 'kuldippushpad1@gmail.com';
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    fullPrompt: '',
    category: 'Admin Panel' as Prompt['category'],
    price: '',
    isFree: false,
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800', // Default
    features: '',
    tools: ''
  });

  const [loading, setLoading] = React.useState(false);

  if (!isAdmin) {
    return <div className="pt-40 text-center">Unauthorized Access</div>;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, fullPrompt: event.target?.result as string }));
        onCopy('Prompt text loaded from file!');
      };
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      // PDF parsing is complex, just notifying for now
      onCopy('PDF detected. Please copy-paste text manually for best results.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await uploadPrompt({
        title: formData.title,
        description: formData.description,
        fullPrompt: formData.fullPrompt,
        category: formData.category,
        price: formData.isFree ? 'Free' : (formData.price.startsWith('$') ? formData.price : `$${formData.price}`),
        isFree: formData.isFree,
        image: formData.image,
        features: formData.features.split(',').map(s => s.trim()),
        tools: formData.tools.split(',').map(s => s.trim())
      });
      
      onCopy('Prompt uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        fullPrompt: '',
        category: 'Admin Panel',
        price: '',
        isFree: false,
        image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
        features: '',
        tools: ''
      });
    } catch (err) {
      onCopy('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 md:pb-32 px-6 max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Admin <span className="gradient-text">Upload</span></h1>
        <button onClick={() => navigate('/listing')} className="btn-outline">View Site</button>
      </div>

      <form onSubmit={handleSubmit} className="glass p-10 rounded-[40px] grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Title</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Modern Admin Dashboard"
              className="w-full glass bg-slate-900/50 py-3 px-6 rounded-2xl outline-none focus:border-brand-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Description</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Short catchy description..."
              className="w-full glass bg-slate-900/50 py-3 px-6 rounded-2xl outline-none focus:border-brand-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Category</label>
            <select 
              value={formData.category}
              onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))}
              className="w-full glass bg-slate-900/50 py-3 px-6 rounded-2xl outline-none focus:border-brand-primary"
            >
              <option>Admin Panel</option>
              <option>Games</option>
              <option>E-commerce</option>
              <option>Tools</option>
            </select>
          </div>
          <div className="flex gap-4">
             <div className="flex-1 space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Price (USD)</label>
               <input 
                  disabled={formData.isFree}
                  value={formData.price}
                  onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                  placeholder="29"
                  className="w-full glass bg-slate-900/50 py-3 px-6 rounded-2xl outline-none focus:border-brand-primary disabled:opacity-50"
                />
             </div>
             <div className="flex flex-col justify-end pb-3">
               <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                  <input 
                    type="checkbox" 
                    checked={formData.isFree}
                    onChange={e => setFormData(p => ({ ...p, isFree: e.target.checked }))}
                    className="w-5 h-5 accent-brand-primary"
                  />
                  Is Free?
               </label>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Prompt Content (.txt support)</label>
            <textarea 
              required
              rows={8}
              value={formData.fullPrompt}
              onChange={e => setFormData(p => ({ ...p, fullPrompt: e.target.value }))}
              placeholder="Paste the full AI prompt here..."
              className="w-full glass bg-slate-900/50 py-3 px-6 rounded-2xl outline-none focus:border-brand-primary text-sm font-mono"
            />
            <input 
              type="file" 
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Features (csv)</label>
              <input 
                value={formData.features}
                onChange={e => setFormData(p => ({ ...p, features: e.target.value }))}
                placeholder="Dark mode, Charts..."
                className="w-full glass bg-slate-900/50 py-3 px-6 rounded-2xl outline-none focus:border-brand-primary text-xs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">Tools (csv)</label>
              <input 
                value={formData.tools}
                onChange={e => setFormData(p => ({ ...p, tools: e.target.value }))}
                placeholder="React, Firebase..."
                className="w-full glass bg-slate-900/50 py-3 px-6 rounded-2xl outline-none focus:border-brand-primary text-xs"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 text-xl flex items-center justify-center gap-2"
          >
            {loading ? 'Uploading...' : 'Publish Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Contact = () => {
  const [sent, setSent] = React.useState(false);

  return (
    <div className="pt-32 pb-24 md:pb-32 px-6 max-w-xl mx-auto">
      <div className="glass p-10 rounded-[40px] space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-center">Get in Touch</h1>
          <p className="text-slate-400 text-center">Have a question or custom prompt request? Let us know!</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-widest">Name</label>
            <input type="text" className="w-full glass bg-slate-900 py-4 px-6 rounded-2xl border-slate-800 outline-none focus:border-brand-primary" placeholder="Kuldeep Pushpad" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-widest">Email</label>
            <input type="email" className="w-full glass bg-slate-900 py-4 px-6 rounded-2xl border-slate-800 outline-none focus:border-brand-primary" placeholder="hello@example.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-widest">Message</label>
            <textarea rows={4} className="w-full glass bg-slate-900 py-4 px-6 rounded-2xl border-slate-800 outline-none focus:border-brand-primary" placeholder="Tell us what you're building..." required />
          </div>
          
          <button type="submit" className="w-full btn-primary py-4 mt-4" disabled={sent}>
             {sent ? 'Message Sent!' : 'Send Message'}
          </button>
        </form>

        <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm mb-4">Connect with us</p>
            <div className="flex justify-center gap-6">
               <button className="text-slate-400 hover:text-white transition-colors">Twitter</button>
               <button className="text-slate-400 hover:text-white transition-colors">GitHub</button>
               <button className="text-slate-400 hover:text-white transition-colors">Dribbble</button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Wrapper ---

export default function App() {
  const [showAuth, setShowAuth] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [prompts, setPrompts] = React.useState<Prompt[]>([]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Create user doc if not exists
        const userRef = doc(db, 'users', u.uid);
        getDoc(userRef).then((snap) => {
            if (!snap.exists()) {
                setDoc(userRef, {
                    email: u.email,
                    isAdmin: u.email === 'kuldippushpad1@gmail.com',
                    purchasedPrompts: []
                });
            }
        });
      }
    });
    
    const unsubPrompts = subscribePrompts(setPrompts);

    return () => {
      unsubscribe();
      unsubPrompts();
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
        await loginWithGoogle();
        setShowAuth(false);
        showToast('Successfully logged in!');
    } catch (e: any) {
        showToast(e.message || 'Login failed.');
    } finally {
        setIsLoggingIn(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar user={user} onOpenAuth={() => setShowAuth(true)} />
        <main>
          <Routes>
            <Route path="/" element={<Home prompts={prompts} />} />
            <Route path="/listing" element={<Listing prompts={prompts} />} />
            <Route path="/dashboard" element={<Dashboard user={user} onCopy={showToast} />} />
            <Route path="/admin" element={<AdminDashboard user={user} onCopy={showToast} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/prompt/:id" element={<PromptDetailView prompts={prompts} onCopy={showToast} />} />
          </Routes>
        </main>
        <BottomNav />

        {/* Global Toast */}
        <AnimatePresence>
            {toast && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] glass px-6 py-3 rounded-full border-brand-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center gap-2"
                >
                    <Check className="text-brand-primary" size={18} />
                    <span className="font-bold text-sm tracking-tight">{toast}</span>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Auth Modal Overlay */}
        <AnimatePresence>
          {showAuth && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-dark/80 backdrop-blur-md"
              onClick={() => setShowAuth(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass w-full max-w-md p-10 rounded-[40px] space-y-8 relative"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setShowAuth(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                  <X />
                </button>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-brand-primary flex items-center justify-center mx-auto">
                    <User className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold">Welcome Back</h2>
                  <p className="text-slate-400">Login to access your premium prompts.</p>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={handleLogin}
                    className="w-full glass py-4 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-colors"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
                    Continue with Google
                  </button>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="h-[1px] flex-1 bg-slate-800" />
                    <span className="text-xs uppercase font-bold tracking-widest">or</span>
                    <div className="h-[1px] flex-1 bg-slate-800" />
                  </div>
                  <input type="email" placeholder="Email Address" className="w-full glass bg-slate-900 border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-brand-primary" />
                  <button className="w-full btn-primary py-4">Sign In</button>
                </div>
                
                <p className="text-center text-slate-500 text-sm">
                  Don't have an account? <button className="text-brand-primary font-bold">Create one</button>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

// Separate component for detail view to handle params
const PromptDetailView = ({ prompts, onCopy }: { prompts: Prompt[], onCopy: (msg: string) => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [copied, setCopied] = React.useState(false);
    const [showBuy, setShowBuy] = React.useState(false);
    
    const activePrompts = prompts.length > 0 ? prompts : STATIC_PROMPTS;
    const prompt = activePrompts.find(p => p.id === id);
    if (!prompt) return <div className="pt-40 text-center">Prompt not found</div>;

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.fullPrompt);
        setCopied(true);
        onCopy('Preview prompt copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pt-32 pb-24 md:pb-32 px-6 max-w-6xl mx-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-12"
             >
                {/* Visuals */}
                <div className="space-y-8">
                    <div className="glass aspect-[4/3] rounded-[40px] overflow-hidden">
                        <img src={prompt.image} alt={prompt.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="glass p-8 rounded-[40px] space-y-6">
                        <h3 className="text-xl font-bold">Key Features</h3>
                        <ul className="space-y-4">
                            {prompt.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                        <Check size={14} />
                                    </div>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-8">
                    <div className="space-y-4">
                         <div className="inline-flex items-center gap-2 glass px-3 py-1 rounded-full text-xs font-bold text-brand-primary">
                            {prompt.category}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{prompt.title}</h1>
                        <p className="text-xl text-slate-400">{prompt.description}</p>
                    </div>

                    <div className="glass p-8 rounded-[40px] space-y-8">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Price</span>
                            <span className="text-3xl font-bold gradient-text">{prompt.price}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setShowBuy(true)} className="flex-1 btn-primary py-4">Buy Now</button>
                            <button onClick={handleCopy} className="flex-1 btn-outline py-4 flex items-center justify-center gap-3">
                                {copied ? <Check size={20} /> : <Copy size={20} />} 
                                {copied ? 'Copied' : 'Copy Preview'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 text-center italic">Includes lifelong updates and commercial license.</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold">Built with</h3>
                        <div className="flex flex-wrap gap-2">
                             {prompt.tools.map((t, i) => (
                                <span key={i} className="glass px-4 py-2 rounded-full text-sm font-medium border-slate-700/50">
                                    {t}
                                </span>
                             ))}
                        </div>
                    </div>
                </div>
             </motion.div>

             {/* Fake Payment Modal */}
             <AnimatePresence>
                {showBuy && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-dark/80 backdrop-blur-md"
                    onClick={() => setShowBuy(false)}
                  >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="glass w-full max-w-md p-10 rounded-[40px] space-y-8 relative"
                        onClick={e => e.stopPropagation()}
                    >
                         <button onClick={() => setShowBuy(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
                            <X />
                        </button>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Checkout</h2>
                            <p className="text-slate-400">Secure payment for {prompt.title}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="glass bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold">1</div>
                                        <span className="font-medium">Product</span>
                                    </div>
                                    <span className="font-bold">{prompt.price}</span>
                                </div>
                                <div className="glass bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold">2</div>
                                        <span className="font-medium">Vat</span>
                                    </div>
                                    <span className="font-bold">$0.00</span>
                                </div>
                            </div>

                            <div className="h-[1px] bg-slate-800" />

                            <div className="flex justify-between items-center px-2">
                                <span className="text-xl font-bold">Total</span>
                                <span className="text-2xl font-bold gradient-text">{prompt.price}</span>
                            </div>

                            <button onClick={() => navigate('/dashboard')} className="w-full btn-primary py-4 text-lg">
                                Complete Purchase
                            </button>
                            
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6 mx-auto opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                        </div>
                    </motion.div>
                  </motion.div>
                )}
             </AnimatePresence>
        </div>
    );
};

// Finished
