import React, { useState, useEffect, useRef } from 'react';
import { 
  Canvas, 
  FabricImage, 
  IText, 
  Rect, 
  Circle, 
  Shadow, 
  filters,
  Object as FabricObject
} from 'fabric';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Type as TextIcon,
  Palette,
  Layout,
  Filter,
  MousePointer2,
  Settings,
  Sparkles,
  Layers,
  ChevronDown,
  Monitor,
  Smartphone,
  Square,
  FileImage,
  Wand2,
  X
} from 'lucide-react';
import { cn, downloadImage } from '@/src/lib/utils';
import { EditorTool } from '@/src/types';
import { editImageWithAI } from '@/src/services/geminiService';

interface CanvasEditorProps {
  onSave: (dataUrl: string) => void;
  externalImage?: string | null;
}

const FONTS = ['Inter', 'Anton', 'JetBrains Mono', 'Georgia', 'Arial'];

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ onSave, externalImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [activeObject, setActiveObject] = useState<FabricObject | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#060608',
      preserveObjectStacking: true
    });

    setFabricCanvas(canvas);

    canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setActiveObject(null));

    return () => {
      canvas.dispose();
    };
  }, []);

  // Handle Resize
  useEffect(() => {
    if (!fabricCanvas || !containerRef.current) return;
    const parent = containerRef.current;

    const resize = () => {
      window.requestAnimationFrame(() => {
        if (!fabricCanvas || !parent) return;
        const containerWidth = parent.clientWidth;
        const containerHeight = parent.clientHeight;
        
        // We want the canvas to be slightly smaller than the container
        const padding = 64;
        const width = Math.max(100, containerWidth - padding);
        const height = Math.max(100, containerHeight - padding);

        fabricCanvas.setDimensions({ width, height });
        fabricCanvas.renderAll();
      });
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    
    // Initial resize
    resize();

    return () => observer.disconnect();
  }, [fabricCanvas]);

  // Handle External Image Loading
  useEffect(() => {
    if (externalImage && fabricCanvas) {
      FabricImage.fromURL(externalImage, { crossOrigin: 'anonymous' }).then((img) => {
        img.scaleToWidth(Math.min(fabricCanvas.width! * 0.7, 1024));
        fabricCanvas.add(img);
        fabricCanvas.centerObject(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      });
    }
  }, [externalImage, fabricCanvas]);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new IText('Double click to edit', {
      left: 150,
      top: 150,
      fontFamily: 'Inter',
      fill: '#ffffff',
      fontSize: 48,
      fontWeight: 'bold',
      shadow: new Shadow({
          color: 'rgba(0,0,0,0.5)',
          blur: 5,
          offsetX: 2,
          offsetY: 2
      })
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  const addShape = (type: string) => {
    if (!fabricCanvas) return;
    let shape;
    const props = {
        left: 200,
        top: 200,
        fill: '#6366f1', // Use accent color
        width: 150,
        height: 150,
    };

    if (type === 'rect') shape = new Rect(props);
    else if (type === 'circle') shape = new Circle({ ...props, radius: 75 });
    
    if (shape) {
        fabricCanvas.add(shape);
        fabricCanvas.setActiveObject(shape);
        fabricCanvas.renderAll();
    }
  };

  const deleteActive = () => {
    if (!fabricCanvas || !activeObject) return;
    fabricCanvas.remove(activeObject);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  };

  const exportCanvas = (multiplier: number = 2) => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      multiplier: multiplier,
    });
    downloadImage(dataUrl, `visionary-export-${Date.now()}.png`);
    onSave(dataUrl);
  };

  const applyAIEdit = async () => {
    if (!fabricCanvas || !aiPrompt) return;
    setIsAiLoading(true);
    try {
        const dataUrl = fabricCanvas.toDataURL({ format: 'png' });
        const resultUrl = await editImageWithAI(dataUrl, aiPrompt);
        
        FabricImage.fromURL(resultUrl, { crossOrigin: 'anonymous' }).then(img => {
            img.scaleToWidth(fabricCanvas.width! * 0.8);
            fabricCanvas.add(img);
            fabricCanvas.centerObject(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
        });
        setAiPrompt('');
        setShowAiInput(false);
    } catch (error) {
        console.error(error);
    } finally {
        setIsAiLoading(false);
    }
  };

  const applyFilter = (type: string) => {
    if (!fabricCanvas || !(activeObject instanceof FabricImage)) return;
    
    let filter;
    switch(type) {
      case 'grayscale': filter = new filters.Grayscale(); break;
      case 'sepia': filter = new filters.Sepia(); break;
      case 'brownie': filter = new filters.Brownie(); break;
      case 'vintage': filter = new filters.Vintage(); break;
      case 'pixelate': filter = new filters.Pixelate({ blocksize: 8 }); break;
      case 'clear': activeObject.filters = []; break;
    }

    if (type !== 'clear' && filter) {
        activeObject.filters.push(filter);
    }
    activeObject.applyFilters();
    fabricCanvas.renderAll();
  };

  return (
    <div className="flex flex-col h-full bg-bg-deep border-x border-white/5 relative">
      {/* AI LOADING OVERLAY */}
      {isAiLoading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                  <div className="w-24 h-24 border-4 border-accent/10 border-t-accent rounded-full animate-spin" />
                  <Sparkles size={32} className="absolute inset-0 m-auto text-accent animate-pulse" />
              </div>
              <div className="text-center">
                  <h3 className="text-xl font-serif italic tracking-widest text-white">Visionary Engine al lavoro...</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-[0.2em]">Rimodellando la realtà neurale</p>
              </div>
          </div>
      )}

      {/* Toolbar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-bg-surface/30 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <ToolButton 
            active={activeTool === 'select'} 
            onClick={() => setActiveTool('select')} 
            icon={<MousePointer2 size={18} />} 
            label="Seleziona" 
          />
          <ToolButton 
            onClick={addText} 
            icon={<TextIcon size={18} />} 
            label="Testo" 
          />
          <div className="relative group/menu">
              <ToolButton 
                icon={<Layout size={18} />} 
                label="Forme" 
              />
              <div className="absolute top-full left-0 hidden group-hover/menu:block bg-bg-surface border border-white/10 p-2 rounded-xl z-50 shadow-2xl mt-1">
                  <button onClick={() => addShape('rect')} className="p-2.5 hover:bg-white/5 rounded-lg flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest w-40 text-zinc-400 hover:text-white"><Square size={14} /> Rettangolo</button>
                  <button onClick={() => addShape('circle')} className="p-2.5 hover:bg-white/5 rounded-lg flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest w-40 text-zinc-400 hover:text-white"><div className="w-[14px] h-[14px] border border-current rounded-full" /> Cerchio</button>
              </div>
          </div>
          
          <div className="w-px h-6 bg-white/10 mx-3" />
          
          <ToolButton 
            onClick={() => setShowAiInput(!showAiInput)} 
            icon={<Wand2 size={18} />} 
            label="Assistente AI" 
            className={showAiInput ? "text-accent bg-accent/10" : "text-accent hover:bg-accent/5"}
          />
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center bg-black/40 rounded-full p-1 border border-white/5 shadow-inner">
                <button onClick={() => exportCanvas(1)} className="px-3 py-1.5 text-[9px] font-bold text-zinc-500 hover:text-white uppercase transition-colors rounded-full hover:bg-white/5">Preview</button>
                <button onClick={() => exportCanvas(2)} className="px-3 py-1.5 text-[9px] font-bold text-zinc-300 hover:text-white uppercase transition-colors rounded-full hover:bg-white/5">High-Res</button>
                <button onClick={() => exportCanvas(4)} className="px-4 py-1.5 text-[9px] font-bold text-accent hover:brightness-125 uppercase transition-colors rounded-full bg-accent/10 border border-accent/20">Ultra 4K</button>
            </div>
            <button 
                onClick={() => exportCanvas(2)}
                className="flex items-center gap-2 px-5 py-2 bg-white text-black font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
            >
                <Download size={14} />
                Esporta
            </button>
        </div>
      </div>

      {/* AI PROMPT BAR */}
      <AnimatePresence>
          {showAiInput && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-accent/5 border-b border-accent/20 overflow-hidden"
              >
                  <div className="p-3.5 flex gap-4 items-center px-6">
                      <Sparkles size={16} className="text-accent shrink-0" />
                      <input 
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Istruzioni AI: 'Trasforma in acquerello', 'Aggiungi nebbia atmosferica'..."
                        className="flex-1 bg-transparent border-none text-sm text-accent placeholder:text-accent/30 focus:ring-0 font-medium"
                      />
                      <button 
                        onClick={applyAIEdit}
                        disabled={!aiPrompt}
                        className="px-5 py-2 bg-accent text-white font-bold text-[10px] uppercase tracking-[0.1em] rounded-full hover:brightness-110 active:scale-95 disabled:opacity-30 shadow-lg shadow-accent/20"
                      >
                          APPLICA NEURALE
                      </button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Editor Main */}
      <div ref={containerRef} className="flex-1 relative bg-[radial-gradient(#ffffff05_1.5px,transparent_1.5px)] [background-size:32px_32px]">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-accent to-purple-600 rounded-lg blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative canvas-container flex items-center justify-center p-2 bg-[#1A1A1F]">
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Quick Zoom / Stats */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] z-40 shadow-2xl">
           <span className="flex items-center gap-2 text-zinc-300 font-bold"><div className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_var(--color-accent)]" /> STUDIO VIEW</span>
           <div className="w-px h-3 bg-white/10" />
           <span>RENDER SCALE: 100%</span>
           <div className="w-px h-3 bg-white/10" />
           <span className="text-zinc-600">800 X 600 • 300 DPI</span>
        </div>
      </div>

      {/* Object Properties Panel */}
      <AnimatePresence>
          {activeObject && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="h-28 border-t border-white/5 bg-bg-surface/95 backdrop-blur-2xl flex items-center px-10 gap-10 z-50 justify-between"
              >
                  <div className="flex items-center gap-10">
                       <div className="flex flex-col gap-2">
                           <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black">Azioni</span>
                           <div className="flex items-center gap-2">
                               <PropButton 
                                    onClick={() => {
                                        activeObject.bringToFront();
                                        fabricCanvas?.renderAll();
                                    }}
                                    icon={<Layers size={14} />} 
                                    label="Sopra" 
                               />
                               <PropButton 
                                    onClick={deleteActive} 
                                    icon={<Trash2 size={16} />} 
                                    label="Rimuovi" 
                                    className="text-red-500 hover:bg-red-500/10"
                               />
                           </div>
                       </div>

                       <div className="w-px h-12 bg-white/5" />

                       {activeObject instanceof FabricImage ? (
                           <div className="flex flex-col gap-2">
                               <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black">Neural Processing</span>
                               <div className="flex gap-1.5">
                                    <FilterButton onClick={() => applyFilter('grayscale')} label="Onyx" />
                                    <FilterButton onClick={() => applyFilter('vintage')} label="Noir" />
                                    <FilterButton onClick={() => applyFilter('brownie')} label="Sepia" />
                                    <FilterButton onClick={() => applyFilter('pixelate')} label="Neural" />
                                    <FilterButton onClick={() => applyFilter('clear')} label="Reset" className="border-red-500/10 text-red-500 hover:bg-red-500/5 hover:text-red-400" />
                               </div>
                           </div>
                       ) : (
                           <div className="flex items-center gap-10">
                               <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black">Cromatico</span>
                                    <div className="relative">
                                      <input 
                                          type="color" 
                                          className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer hover:border-white/20 transition-colors" 
                                          value={typeof activeObject.get('fill') === 'string' ? (activeObject.get('fill') as string) : '#ffffff'}
                                          onChange={(e) => {
                                              activeObject.set('fill', e.target.value);
                                              fabricCanvas?.renderAll();
                                          }}
                                      />
                                    </div>
                               </div>

                               {activeObject instanceof IText && (
                                   <div className="flex flex-col gap-2">
                                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black">Parametri Tipografici</span>
                                        <div className="flex items-center gap-4">
                                            <select 
                                                className="bg-black/50 border border-white/10 text-[10px] font-bold rounded-lg px-3 py-2 uppercase tracking-widest outline-none focus:border-accent transition-all text-gray-300"
                                                value={activeObject.get('fontFamily')}
                                                onChange={(e) => {
                                                    activeObject.set('fontFamily', e.target.value);
                                                    fabricCanvas?.renderAll();
                                                }}
                                            >
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                                                <input 
                                                    type="range" 
                                                    min="12" max="300" 
                                                    className="w-32 h-1 bg-white/10 rounded-full accent-accent"
                                                    value={activeObject.get('fontSize')}
                                                    onChange={(e) => {
                                                        activeObject.set('fontSize', parseInt(e.target.value));
                                                        fabricCanvas?.renderAll();
                                                    }}
                                                />
                                                <span className="text-[10px] font-mono text-white/40 w-8 text-right font-bold">{Math.round(activeObject.get('fontSize') || 0)}</span>
                                            </div>
                                        </div>
                                   </div>
                               )}
                           </div>
                       )}
                  </div>
                  
                  <button 
                    onClick={() => fabricCanvas?.discardActiveObject().renderAll()}
                    className="p-3 text-zinc-600 hover:text-white transition-all bg-white/5 rounded-full hover:bg-white/10"
                  >
                      <X size={20} />
                  </button>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

const ToolButton = ({ active, onClick, icon, label, className, disabled }: any) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "p-2.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1 group relative",
      active ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-zinc-500 hover:bg-white/5 hover:text-white",
      className,
      disabled && "opacity-20 cursor-not-allowed"
    )}
  >
    {icon}
    <span className="text-[7px] uppercase tracking-widest font-black absolute -top-1 px-1.5 py-0.5 bg-zinc-900 border border-white/10 rounded shadow-2xl transition-opacity opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none translate-y-[-100%] z-[60]">
        {label}
    </span>
  </button>
);

const PropButton = ({ active, onClick, icon, label, className }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-10 h-10 flex items-center justify-center rounded-lg transition-all border border-white/5",
      active ? "bg-accent text-white" : "bg-black/20 text-zinc-500 hover:text-white hover:bg-black/40",
      className
    )}
    title={label}
  >
    {icon}
  </button>
);

const FilterButton = ({ onClick, label, className }: any) => (
    <button 
      onClick={onClick}
      className={cn(
          "px-4 py-2 bg-black/40 border border-white/5 text-[10px] rounded-lg font-bold hover:border-accent hover:text-white transition-all uppercase tracking-widest text-gray-500",
          className
      )}
    >
        {label}
    </button>
);

