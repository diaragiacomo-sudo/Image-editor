export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt: number;
  width: number;
  height: number;
}

export interface Collection {
  id: string;
  name: string;
  imageIds: string[];
}

export type EditorTool = 'select' | 'text' | 'image' | 'filter' | 'draw' | 'erase';

export interface CanvasState {
  zoom: number;
  background: string | null;
}
