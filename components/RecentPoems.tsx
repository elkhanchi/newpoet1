import React from 'react';
import { PoemResponse } from '../types';
import { FileText } from 'lucide-react';
import { SoundType } from '../hooks/useSoundSystem';

interface RecentPoemsProps {
  poems: PoemResponse[];
  onSelect: (poem: PoemResponse) => void;
  playSound: (type: SoundType) => void;
}

export const RecentPoems: React.FC<RecentPoemsProps> = ({ poems, onSelect, playSound }) => {
  if (poems.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 animate-fade-in-up">
      <h2 className="text-2xl md:text-3xl font-amiri font-bold text-deep-green text-center mb-8 flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gold"></span>
        <span>آخر القصائد المحفوظة</span>
        <span className="h-px w-10 bg-gold"></span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {poems.slice(0, 6).map((poem) => (
          <button
            key={poem.createdAt}
            onClick={() => {
              onSelect(poem);
            }}
            className="group bg-parchment/40 backdrop-blur-sm border border-gold/20 rounded-lg p-5 text-right hover:border-gold hover:bg-white/50 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-amiri font-bold text-xl text-deep-green mb-2 group-hover:text-gold-dark transition-colors line-clamp-2">
                {poem.title}
              </h3>
              <FileText className="w-5 h-5 text-gold/60 shrink-0 ml-2" />
            </div>
            <p className="font-tajawal text-xs text-stone-500">
              {new Date(poem.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
             <p className="font-kufi text-[10px] text-stone-400 mt-2 uppercase tracking-widest">
              {poem.meterUsed}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};