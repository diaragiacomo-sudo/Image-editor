import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Grid, 
  Clock, 
  Image as ImageIcon,
  Heart,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GeneratedImage } from '@/src/types';

interface CollectionGalleryProps {
  onSelectImage: (url: string) => void;
  savedImages: GeneratedImage[];
  onDeleteImage: (id: string) => void;
}

export const CollectionGallery: React.FC<CollectionGalleryProps> = ({ 
  onSelectImage, 
  savedImages,
  onDeleteImage 
}) => {
  return (
    <div className="w-80 h-full flex flex-col bg-bg-surface border-l border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div>
            <h2 className="text-xl font-serif italic tracking-widest text-white/90">Gallery</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-[0.2em]">Collezione Privata</p>
        </div>
        <div className="bg-accent/10 text-accent px-2 py-1 rounded text-[10px] font-bold border border-accent/20">
            {savedImages.length} ITEMS
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {savedImages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4 px-8 text-center italic">
            <ImageIcon size={48} strokeWidth={1} className="opacity-10" />
            <p className="text-xs tracking-widest leading-relaxed">Nessuna opera salvata.<br/>Genera e aggiungi ai preferiti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-8">
            {savedImages.map((img) => (
              <div 
                key={img.id} 
                className="group relative aspect-square bg-bg-deep rounded overflow-hidden border border-white/5 hover:border-accent/40 transition-all cursor-pointer shadow-xl"
              >
                <img 
                  src={img.url} 
                  alt={img.prompt} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onClick={() => onSelectImage(img.url)}
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[#060608]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button 
                        onClick={() => onSelectImage(img.url)}
                        className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
                        title="Usa in Editor"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteImage(img.id);
                        }}
                        className="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                        title="Elimina"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[7px] text-white/50 uppercase font-mono truncate tracking-widest">
                        {img.prompt}
                    </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics / Status */}
      <div className="p-5 bg-black/40 border-t border-white/5">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-600">
              <span className="flex items-center gap-2 italic"><div className="w-1.5 h-1.5 bg-accent/40 rounded-full" /> SINCRONIZZATO</span>
              <span className="text-zinc-700">CLOUD STORAGE: 12%</span>
          </div>
      </div>
    </div>
  );
};
