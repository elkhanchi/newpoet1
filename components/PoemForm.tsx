import React, { useState, useRef } from 'react';
import { PoemMood, PoemMeter, PoemRequest } from '../types';
import { Feather, Send } from 'lucide-react';
import { SoundType } from '../hooks/useSoundSystem';

interface PoemFormProps {
  onSubmit: (request: PoemRequest) => void;
  isLoading: boolean;
  playSound: (type: SoundType) => void;
}

export const PoemForm: React.FC<PoemFormProps> = ({ onSubmit, isLoading, playSound }) => {
  const [topic, setTopic] = useState('');
  const [recipient, setRecipient] = useState('');
  const [mood, setMood] = useState<PoemMood>(PoemMood.Love);
  const [meter, setMeter] = useState<PoemMeter>(PoemMeter.Any);
  const [verseCount, setVerseCount] = useState<number | ''>('');
  
  // Throttle typing sound
  const lastSoundTime = useRef(0);

  const handleTyping = () => {
    const now = Date.now();
    // Play sound at most every 80ms to avoid machine-gun effect
    if (now - lastSoundTime.current > 80) {
      playSound('quill');
      lastSoundTime.current = now;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    // Validate verse count to ensure it's within range if provided
    let finalVerseCount = undefined;
    if (verseCount !== '' && !isNaN(Number(verseCount))) {
        // Clamp value between 6 and 20 if entered manually out of bounds
        const val = Number(verseCount);
        finalVerseCount = Math.min(Math.max(val, 6), 20);
    }

    onSubmit({ 
        topic, 
        recipient, 
        mood, 
        meter,
        verseCount: finalVerseCount
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/60 backdrop-blur-sm border border-gold/30 rounded-xl p-5 md:p-8 shadow-lg relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 border-t-2 border-r-2 border-gold opacity-50 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 border-b-2 border-l-2 border-gold opacity-50 rounded-bl-xl"></div>

      <h2 className="text-2xl md:text-3xl font-amiri font-bold text-deep-green text-center mb-6 md:mb-8 flex items-center justify-center gap-3">
        <Feather className="w-5 h-5 md:w-6 md:h-6 text-gold" />
        <span>اطلب قصيدتك من الشاعر م . الكديري</span>
        <Feather className="w-5 h-5 md:w-6 md:h-6 text-gold scale-x-[-1]" />
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic" className="block text-deep-green font-tajawal font-bold mb-2">
            موضوع القصيدة (عن ماذا تريدني أن أكتب؟)
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="مثلا: وصف ليلة قمرية ,الوقوف على الاطلال,الحنين ,الشوق..."
            className="w-full bg-parchment border border-stone-300 rounded-lg px-4 py-3 text-base md:text-lg font-tajawal focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all placeholder-stone-400"
            required
            disabled={isLoading}
          />
        </div>

        {/* Mood & Meter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label htmlFor="mood" className="block text-deep-green font-tajawal font-bold mb-2">
              الغرض الشعري
            </label>
            <select
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value as PoemMood)}
              className="w-full bg-parchment border border-stone-300 rounded-lg px-4 py-3 font-tajawal focus:ring-2 focus:ring-gold outline-none appearance-none cursor-pointer"
              disabled={isLoading}
            >
              {Object.values(PoemMood).map((m) => (
                <option 
                  key={m} 
                  value={m} 
                  disabled={m === PoemMood.Satire}
                  className={m === PoemMood.Satire ? 'text-stone-400' : ''}
                >
                  {m} {m === PoemMood.Satire ? '(غير متاح)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="meter" className="block text-deep-green font-tajawal font-bold mb-2">
              البحر الشعري (اختياري)
            </label>
            <select
              id="meter"
              value={meter}
              onChange={(e) => setMeter(e.target.value as PoemMeter)}
              className="w-full bg-parchment border border-stone-300 rounded-lg px-4 py-3 font-tajawal focus:ring-2 focus:ring-gold outline-none appearance-none cursor-pointer"
              disabled={isLoading}
            >
              {Object.values(PoemMeter).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipient & Verse Count Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          <div className="md:col-span-2">
            <label htmlFor="recipient" className="block text-deep-green font-tajawal font-bold mb-2">
               المهدى إليه (اختياري)
            </label>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="اسم الشخص أو الجهة..."
              className="w-full bg-parchment border border-stone-300 rounded-lg px-4 py-3 font-tajawal focus:ring-2 focus:ring-gold outline-none"
              disabled={isLoading}
            />
          </div>

          <div>
             <label htmlFor="verseCount" className="block text-deep-green font-tajawal font-bold mb-2">
               عدد الأبيات (6-20)
             </label>
             <input
               type="number"
               id="verseCount"
               min="6"
               max="20"
               value={verseCount}
               onChange={(e) => {
                 const val = parseInt(e.target.value);
                 if (isNaN(val)) setVerseCount('');
                 else setVerseCount(val);
               }}
               placeholder="تلقائي (6-12)"
               className="w-full bg-parchment border border-stone-300 rounded-lg px-4 py-3 font-tajawal focus:ring-2 focus:ring-gold outline-none text-center placeholder-stone-400"
               disabled={isLoading}
             />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`
              flex items-center gap-2 bg-deep-green text-gold-dark hover:text-parchment hover:bg-emerald-900 
              font-amiri font-bold text-lg md:text-xl py-3 px-8 md:px-12 rounded-full shadow-md 
              transition-all duration-300 transform hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center
            `}
          >
            {isLoading ? (
              <span>جارٍ النظم...</span>
            ) : (
              <>
                <span>انظم لي الأبيات</span>
                <Send className="w-5 h-5 ml-2 rtl:rotate-180" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};