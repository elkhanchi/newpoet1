import React from 'react';
import { PenTool } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 md:py-8 px-4 text-center relative z-10">
      <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-gold/10 mb-3 md:mb-4 border border-gold/20">
        <PenTool className="w-6 h-6 md:w-8 md:h-8 text-deep-green" />
      </div>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-amiri font-bold text-deep-green mb-2 md:mb-3 tracking-wide">
        صدى الأقلام
      </h1>
      <div className="flex justify-center items-center gap-2 mb-3 md:mb-4">
        <span className="h-px w-6 md:w-8 bg-gold"></span>
        <h2 className="text-lg md:text-2xl font-amiri text-gold-dark font-bold">الشاعر م . الكديري</h2>
        <span className="h-px w-6 md:w-8 bg-gold"></span>
      </div>
      <p className="text-base md:text-xl font-kufi text-stone-600 max-w-xl mx-auto leading-relaxed px-4">
        أكتب لكم بمداد القلب ما يعجز عنه اللسان. اطلب قصيدتك وسأنسجها لك الآن.
      </p>
    </header>
  );
};