import React, { useState, useRef } from 'react';
import { Search, Upload } from 'lucide-react';
import { SoundType } from '../hooks/useSoundSystem';

interface PoemAnalyzerProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
  playSound: (type: SoundType) => void;
}

export const PoemAnalyzer: React.FC<PoemAnalyzerProps> = ({ onAnalyze, isLoading, playSound }) => {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const lastSoundTime = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastSoundTime.current > 80) {
      playSound('quill');
      lastSoundTime.current = now;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAnalyze(text);
  };

  const processFile = (file: File) => {
    // Basic check for text files
    if (file.type && !file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      alert("يرجى رفع ملف نصي (Text file) فقط.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        playSound('paper');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
      e.target.value = ''; // Reset
    }
  };

  const triggerFileUpload = () => {
    playSound('ink');
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/60 backdrop-blur-sm border border-gold/30 rounded-xl p-5 md:p-8 shadow-lg relative overflow-hidden animate-fade-in-up">
       {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 border-t-2 border-r-2 border-gold opacity-50 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 border-b-2 border-l-2 border-gold opacity-50 rounded-bl-xl"></div>

      <h2 className="text-2xl md:text-3xl font-amiri font-bold text-deep-green text-center mb-6 md:mb-8 flex items-center justify-center gap-3">
        <Search className="w-5 h-5 md:w-6 md:h-6 text-gold" />
        <span>محلل الشعر العربي</span>
        <Search className="w-5 h-5 md:w-6 md:h-6 text-gold scale-x-[-1]" />
      </h2>

      <p className="text-center text-stone-600 font-tajawal mb-6">
        ضع أي نص أو قصيدة هنا وسأقوم بدراسة بحورها، استخراج معانيها، والتحقق من سلامة وزنها العروضي.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className="relative group"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-parchment/90 backdrop-blur-sm border-2 border-dashed border-deep-green rounded-lg z-20 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
               <Upload className="w-10 h-10 text-deep-green mb-2 animate-bounce" />
               <p className="font-tajawal font-bold text-deep-green">أفلت الملف هنا...</p>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="أدخل الأبيات الشعرية هنا أو قم برفع (أو سحب) ملف نصي..."
            className={`w-full h-48 bg-parchment border rounded-lg px-4 py-3 font-amiri text-lg focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all placeholder-stone-400 resize-none leading-loose text-center scrollbar-thin scrollbar-thumb-gold/50 
              ${isDragging ? 'border-deep-green bg-white' : 'border-stone-300'}
            `}
            required
            disabled={isLoading}
            dir="rtl"
          />
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".txt" 
            className="hidden" 
          />
          
          <button 
            type="button"
            onClick={triggerFileUpload}
            disabled={isLoading}
            className="absolute top-3 left-3 p-2 bg-white/50 hover:bg-white text-gold-dark hover:text-deep-green rounded-full shadow-sm transition-all duration-300 border border-gold/20 opacity-70 hover:opacity-100"
            title="رفع ملف نصي"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className={`
              flex items-center gap-2 bg-deep-green text-gold-dark hover:text-parchment hover:bg-emerald-900 
              font-amiri font-bold text-lg md:text-xl py-3 px-8 md:px-12 rounded-full shadow-md 
              transition-all duration-300 transform hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center
            `}
          >
             {isLoading ? 'جاري التحليل...' : 'تحليل القصيدة'}
          </button>
        </div>
      </form>
    </div>
  );
};