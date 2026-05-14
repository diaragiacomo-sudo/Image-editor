import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon,
  Search,
  Zap,
  Palette,
  Monitor,
  Camera,
  Grid
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { generateAIImage } from '@/src/services/geminiService';

interface GeneratorPaneProps {
  onImageGenerated: (url: string) => void;
}

const STYLES = [
  { id: 'cinematic', name: 'Cinematografico', icon: <Monitor size={14} /> },
  { id: 'photorealistic', name: 'Fotorealistico', icon: <Camera size={14} /> },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: <Zap size={14} /> },
  { id: 'surrealist', name: 'Surrealismo', icon: <Sparkles size={14} /> },
  { id: 'watercolor', name: 'Acquerello', icon: <Palette size={14} /> },
  { id: 'oil-painting', name: 'Pittura ad Olio', icon: <Palette size={14} /> },
  { id: 'pop-art', name: 'Pop Art', icon: <Grid size={14} /> },
  { id: 'sketch', name: 'Bozzetto', icon: <Search size={14} /> },
];

const RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const GeneratorPane: React.FC<GeneratorPaneProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const url = await generateAIImage(prompt, selectedStyle, selectedRatio);
      if (url) onImageGenerated(url);
    } catch (err: any) {
      setError(err.message || "Errore durante la generazione");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageGenerated(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-80 h-full flex flex-col bg-bg-surface border-r border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-black/20">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">AI Prompt</label>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Un astronauta cibernetico che cavalca un'onda elettrica..."
          className="w-full h-36 bg-black border border-white/10 rounded-lg p-3 text-sm text-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-accent transition-all placeholder:text-zinc-700"
        />
        
        <div className="mt-4 flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-400 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                Carica Ref
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
            <button 
                onClick={() => {
                    const url = window.prompt("Inserisci l'URL dell'immagine:");
                    if (url) onImageGenerated(url);
                }}
                className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-400 hover:bg-white/10 hover:border-white/20 transition-all"
            >
                URL
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Style Selection */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Stile Artistico</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all",
                  selectedStyle === style.id 
                    ? "bg-accent text-white border-white/10 shadow-lg shadow-accent/20" 
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                )}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Formato & Parametri</label>
          <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {RATIOS.map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setSelectedRatio(ratio)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all",
                      selectedRatio === ratio
                        ? "bg-accent/20 text-accent border-accent/40"
                        : "bg-black/40 border-white/5 text-gray-500 hover:border-white/20"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase"><span>HD Render Scale</span><span>Quality Focus</span></div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-accent w-3/4 h-full" />
                  </div>
              </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-[10px] text-center font-serif italic">{error}</p>}
      </div>

      {/* Generate Button Container */}
      <div className="p-6 bg-accent/5 border-t border-white/10">
        <button 
          disabled={isLoading || !prompt}
          onClick={handleGenerate}
          className={cn(
            "w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95",
            isLoading 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none" 
              : "bg-accent hover:brightness-110 shadow-accent/20"
          )}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              GENERA VISIONE
            </>
          )}
        </button>
        <p className="text-[9px] text-center text-gray-600 mt-3 font-mono">Consuma 1.5 Crediti Render</p>
      </div>
    </div>
  );
};
