import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Menu, 
  X, 
  Github, 
  Twitter, 
  LayoutGrid, 
  PanelLeft, 
  PanelRight,
  Sparkles,
  Command
} from 'lucide-react';
import { GeneratorPane } from './components/GeneratorPane';
import { CanvasEditor } from './components/CanvasEditor';
import { CollectionGallery } from './components/CollectionGallery';
import { GeneratedImage } from './types';
import { cn, generateId } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [savedImages, setSavedImages] = useState<GeneratedImage[]>([]);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [showLeftPane, setShowLeftPane] = useState(true);
  const [showRightPane, setShowRightPane] = useState(true);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem('visionary_images');
    if (stored) {
      try {
        setSavedImages(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load images", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('visionary_images', JSON.stringify(savedImages));
  }, [savedImages]);

  const handleImageOutput = (url: string) => {
    setEditorImage(url);
  };

  const saveToGallery = (dataUrl: string) => {
    const newImage: GeneratedImage = {
      id: generateId(),
      url: dataUrl,
      prompt: 'Editor Export',
      style: 'Custom',
      createdAt: Date.now(),
      width: 0,
      height: 0
    };
    setSavedImages([newImage, ...savedImages]);
  };

  const deleteFromGallery = (id: string) => {
    setSavedImages(savedImages.filter(img => img.id !== id));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-base selection:bg-accent selection:text-white">
      {/* Top Header */}
      <header className="h-16 bg-bg-surface/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-serif text-2xl italic shadow-lg shadow-accent/20">
              V
            </div>
            <h1 className="text-lg font-serif italic tracking-wide text-white/90">
              Untitled Generation <span className="text-zinc-500 text-sm not-italic ml-1 font-sans">01</span>
            </h1>
          </div>
          
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>

          <nav className="hidden md:flex items-center gap-8">
             <NavTab active label="Editor" />
             <NavTab label="Layers" />
             <NavTab label="History" />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <Sparkles size={12} className="text-accent" />
            Credits: <span className="text-white">1,240</span>
          </div>
          
          <div className="flex items-center gap-1.5">
             <IconButton onClick={() => setShowLeftPane(!showLeftPane)} icon={<PanelLeft size={18} />} active={showLeftPane} />
             <IconButton onClick={() => setShowRightPane(!showRightPane)} icon={<PanelRight size={18} />} active={showRightPane} />
          </div>

          <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden cursor-pointer hover:border-accent transition-colors">
             <img src="https://i.pravatar.cc/100" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden bg-bg-deep">
        {/* Left Sidebar - Generator */}
        <AnimatePresence initial={false}>
          {showLeftPane && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 z-20"
            >
              <GeneratorPane onImageGenerated={handleImageOutput} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Content - Canvas */}
        <div className="flex-1 min-w-0 flex flex-col relative z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
          <CanvasEditor onSave={saveToGallery} externalImage={editorImage} />
        </div>

        {/* Right Sidebar - Gallery */}
        <AnimatePresence initial={false}>
          {showRightPane && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 z-20"
            >
              <CollectionGallery 
                savedImages={savedImages} 
                onSelectImage={handleImageOutput} 
                onDeleteImage={deleteFromGallery}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-bg-base border-t border-white/5 px-6 flex items-center justify-between shrink-0 text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" /> 
                System Latency: 42ms
            </span>
            <span className="border-l border-white/10 pl-6">WORKSPACE 01 / READY</span>
         </div>
         <div className="flex items-center gap-4">
            <span className="italic">Powered by Visionary Neural Engine</span>
            <Command size={11} className="opacity-50" />
         </div>
      </footer>
    </div>
  );
}

const NavTab = ({ label, active }: any) => (
  <button className={cn(
    "text-[10px] uppercase font-bold tracking-[0.2em] h-16 flex items-center border-b-2 transition-all",
    active ? "border-accent text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
  )}>
    {label}
  </button>
);

const IconButton = ({ icon, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-9 h-9 flex items-center justify-center rounded-lg transition-all",
      active ? "text-white bg-white/10 border border-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
    )}
  >
    {icon}
  </button>
);
