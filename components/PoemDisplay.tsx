import React, { useState, useEffect, useRef } from 'react';
import { PoemResponse } from '../types';
import { Copy, RefreshCw, Edit3, Check, X, Share2, Moon, Sun, BookOpen, Loader2, Book, Download, FileText, ArrowUp, Microscope, Music, Search, History, Library, Volume2, Square, Music2, User, ChevronDown } from 'lucide-react';
import { explainVerse, synthesizePoem } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { SoundType } from '../hooks/useSoundSystem';

// Inform TypeScript that lamejs is available on the global window object
declare const lamejs: any;

interface PoemDisplayProps {
  poem: PoemResponse;
  onReset: () => void;
  playSound: (type: SoundType) => void;
  history?: PoemResponse[];
  onSelectHistory?: (poem: PoemResponse) => void;
}

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createWavHeader(pcmLength: number, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmLength, true);
  
  return buffer;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const PoemDisplay: React.FC<PoemDisplayProps> = ({ poem: initialPoem, onReset, playSound, history = [], onSelectHistory }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPoem, setCurrentPoem] = useState(initialPoem);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAudioExportMenuOpen, setIsAudioExportMenuOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editVerses, setEditVerses] = useState('');
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastBase64Audio, setLastBase64Audio] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const poemRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const audioExportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPoem(initialPoem);
    setExplanations({});
    setActiveVerseIndex(null);
    setSearchTerm('');
    setLastBase64Audio(null);
    stopAudio();
  }, [initialPoem]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      stopAudio();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (audioExportMenuRef.current && !audioExportMenuRef.current.contains(event.target as Node)) {
        setIsAudioExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch(e) {}
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleReadAloud = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsSynthesizing(true);
    playSound('ink');
    try {
      const fullText = `${currentPoem.title}. ${currentPoem.verses.join('. ')}`;
      const base64Audio = await synthesizePoem(fullText);
      setLastBase64Audio(base64Audio);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      audioSourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio synthesis failed", err);
      alert("عذراً، تعذر قراءة القصيدة حالياً.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const downloadBlob = (blob: Blob, extension: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPoem.title.replace(/\s+/g, '_')}_صوت.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAudio = async (format: 'wav' | 'mp3' | 'aac') => {
    playSound('paper');
    setIsAudioExportMenuOpen(false);
    let base64 = lastBase64Audio;

    if (!base64) {
      setIsSynthesizing(true);
      try {
        const fullText = `${currentPoem.title}. ${currentPoem.verses.join('. ')}`;
        base64 = await synthesizePoem(fullText);
        setLastBase64Audio(base64);
      } catch (err) {
        alert("فشل في تحضير الملف الصوتي.");
        setIsSynthesizing(false);
        return;
      } finally {
        setIsSynthesizing(false);
      }
    }

    if (!base64) return;
    const pcmDataBytes = decodeBase64(base64);
    const sampleRate = 24000;
    const channels = 1;

    switch (format) {
      case 'wav': {
        const wavHeader = createWavHeader(pcmDataBytes.length, sampleRate);
        const wavBlob = new Blob([wavHeader, pcmDataBytes], { type: 'audio/wav' });
        downloadBlob(wavBlob, 'wav');
        break;
      }
      case 'mp3': {
        if (typeof lamejs === 'undefined') {
          alert("عذراً، حدث خطأ أثناء تحميل أداة ترميز الصوت. لا يمكن تصدير MP3.");
          return;
        }
        const pcmDataInt16 = new Int16Array(pcmDataBytes.buffer);
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
        const sampleBlockSize = 1152;
        const mp3Data = [];
        for (let i = 0; i < pcmDataInt16.length; i += sampleBlockSize) {
          const sampleChunk = pcmDataInt16.subarray(i, i + sampleBlockSize);
          const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
          if (mp3buf.length > 0) mp3Data.push(mp3buf);
        }
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
        const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
        downloadBlob(mp3Blob, 'mp3');
        break;
      }
      case 'aac': {
        const mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            alert('عذراً، متصفحك لا يدعم تصدير الصوت بصيغة AAC.');
            return;
        }
    
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
        }
    
        try {
            const audioBuffer = await decodeAudioData(pcmDataBytes, audioContextRef.current, sampleRate, channels);
            const destination = audioContextRef.current.createMediaStreamDestination();
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(destination);
    
            const recordedData = await new Promise<Blob>((resolve) => {
                const chunks: Blob[] = [];
                const recorder = new MediaRecorder(destination.stream, { mimeType, audioBitsPerSecond: 128000 });
                
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };
                
                recorder.onstop = () => {
                    resolve(new Blob(chunks, { type: mimeType }));
                };
                
                recorder.start();
                source.start();
    
                const durationInMs = audioBuffer.duration * 1000;
                setTimeout(() => {
                    if (recorder.state === 'recording') recorder.stop();
                    source.disconnect();
                }, durationInMs + 100); 
            });
    
            if (recordedData.size > 0) {
                downloadBlob(recordedData, 'm4a');
            } else {
                throw new Error("Recording resulted in an empty file.");
            }
    
        } catch (err) {
            console.error("AAC encoding failed:", err);
            alert("عذراً، حدث خطأ أثناء تحويل الصوت إلى صيغة AAC.");
        }
    
        break;
      }
    }
  };

  const handleExportPDF = async () => {
    if (!poemRef.current) return;
    playSound('paper');
    setIsExporting(true);
    setIsExportMenuOpen(false);

    const previousActiveIndex = activeVerseIndex;
    if (previousActiveIndex !== null) {
      setActiveVerseIndex(null);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const element = poemRef.current;
    const originalStyle = element.getAttribute('style');
    const verseElements = Array.from(element.querySelectorAll('.poem-verse-text')) as HTMLElement[];
    
    // Prepare for canvas capture
    element.style.overflow = 'visible';
    element.style.height = 'auto';
    verseElements.forEach(el => {
        el.classList.remove('overflow-x-auto', 'scrollbar-hide');
    });

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkMode ? '#18181b' : '#fdfbf7',
        logging: false,
        width: element.offsetWidth,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
        letterRendering: true, // Attempt to fix text distortion
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeightInMm = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeightInMm;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInMm);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeightInMm;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInMm);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${currentPoem.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('عذراً، حدث خطأ أثناء إنشاء ملف PDF.');
    } finally {
      // Restore styles
      if (originalStyle) element.setAttribute('style', originalStyle);
      else element.removeAttribute('style');
      verseElements.forEach(el => {
          el.classList.add('overflow-x-auto', 'scrollbar-hide');
      });

      if (previousActiveIndex !== null) setActiveVerseIndex(previousActiveIndex);
      setIsExporting(false);
    }
  };

  const handleExportText = () => {
    playSound('paper');
    setIsExportMenuOpen(false);
    const textContent = `${currentPoem.title}\n\n${currentPoem.verses.join('\n')}\n\n${currentPoem.difficultWords ? '--- معاني المفردات ---\n' + currentPoem.difficultWords.map(w => `${w.word}: ${w.meaning}`).join('\n') : ''}\n\n${currentPoem.critique ? '--- التحليل النقدي ---\n' + currentPoem.critique + '\n\n' : ''}${currentPoem.meterAnalysis ? '--- دراسة بحر القصيدة ---\n' + currentPoem.meterAnalysis + '\n\n' : ''}نظم بواسطة: الشاعر م . الكديري`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPoem.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    playSound('paper');
    const text = `${currentPoem.title}\n\n${currentPoem.verses.join('\n')}\n\nبقلم: الشاعر م . الكديري`;
    const encodedText = encodeURIComponent(text);
    let url = '';

    switch (platform) {
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodedText}`; break;
      case 'facebook': url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`; break;
      case 'whatsapp': url = `https://api.whatsapp.com/send?text=${encodedText}`; break;
    }
    if (url) window.open(url, '_blank');
  };

  const handleScrollToTop = () => {
    playSound('paper');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    const newVerses = editVerses.split('\n').filter(line => line.trim() !== '');
    setCurrentPoem({ ...currentPoem, title: editTitle, verses: newVerses });
    setIsEditing(false);
    playSound('ink');
  };

  const handleStartEditing = () => {
    playSound('ink');
    setEditTitle(currentPoem.title);
    setEditVerses(currentPoem.verses.join('\n'));
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    playSound('paper');
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      {!isEditing && (
        <div className="mb-6 relative z-30" ref={searchContainerRef}>
          <div className={`relative flex items-center bg-white/40 backdrop-blur-md border rounded-full px-4 py-2 transition-all duration-300 ${isSearchFocused ? 'border-gold ring-2 ring-gold/20 shadow-lg' : 'border-gold/30 shadow-sm'}`}>
            <Library className={`w-5 h-5 ml-3 ${isDarkMode ? 'text-gold' : 'text-deep-green'}`} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} placeholder="ابحث في مكتبة قصائدك السابقة..." className="w-full bg-transparent outline-none font-tajawal text-lg placeholder-stone-400" dir="rtl" />
            <Search className="w-5 h-5 mr-3 text-stone-400" />
          </div>
          {isSearchFocused && history.length > 0 && (
            <div className={`absolute top-full mt-2 w-full max-h-80 overflow-y-auto rounded-xl shadow-2xl border animate-fade-in-up backdrop-blur-xl ${isDarkMode ? 'bg-zinc-900/95 border-gold/20' : 'bg-white/95 border-gold/30'}`}>
              <div className="p-2">
                {history.filter(item => item.title.includes(searchTerm)).map((item, idx) => (
                  <button key={idx} onClick={() => { onSelectHistory?.(item); setIsSearchFocused(false); }} className={`w-full text-right px-4 py-3 rounded-lg flex flex-col gap-1 transition-all ${isDarkMode ? 'hover:bg-white/5 text-gold' : 'hover:bg-black/5 text-deep-green'}`}>
                    <span className="font-amiri font-bold text-lg">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={poemRef} className={`border-2 shadow-2xl rounded-sm p-5 md:p-12 relative transition-all duration-700 ${isDarkMode ? 'bg-zinc-900 border-zinc-700 text-stone-300' : 'bg-parchment border-gold/40 text-ink'}`}>
        <button onClick={() => setIsDarkMode(!isDarkMode)} data-html2canvas-ignore className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors">{isDarkMode ? <Sun className="text-gold" /> : <Moon className="text-deep-green" />}</button>
        <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none opacity-50 transition-opacity ${isDarkMode ? 'mix-blend-overlay opacity-5' : ''}`}></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="flex justify-center items-center gap-4 mb-4 opacity-70">
             <div className="h-px w-10 md:w-20 bg-gold"></div>
             <span className="font-kufi text-xs md:text-sm tracking-widest uppercase">{currentPoem.meterUsed}</span>
             <div className="h-px w-10 md:w-20 bg-gold"></div>
          </div>
          {isEditing ? <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full text-center text-3xl md:text-5xl font-amiri font-bold bg-transparent border-b-2 outline-none border-gold/30" /> : <h2 className="text-3xl md:text-5xl font-amiri font-bold mb-2 text-deep-green">{currentPoem.title}</h2>}
          
          {!isEditing && currentPoem.createdAt && (
            <p className="font-tajawal text-xs text-stone-400 mt-1">
              {new Date(currentPoem.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}

          {!isEditing && (
            <div data-html2canvas-ignore className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={handleReadAloud} disabled={isSynthesizing} className={`flex items-center gap-2 px-6 py-2 rounded-full font-tajawal font-bold transition-all shadow-md ${isPlaying ? 'bg-red-100 text-red-700' : 'bg-gold/10 text-gold-dark hover:bg-gold/20'}`}>
                {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlaying ? 'إيقاف القراءة' : 'قراءة القصيدة'}</span>
              </button>
              
              <div className="relative" ref={audioExportMenuRef}>
                <button
                  onClick={() => { setIsAudioExportMenuOpen(!isAudioExportMenuOpen); playSound('ink'); }}
                  disabled={isSynthesizing}
                  className="flex items-center gap-2 px-6 py-2 rounded-full font-tajawal font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 shadow-md"
                >
                  <Music2 className="w-4 h-4" />
                  <span>تحميل الصوت</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAudioExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAudioExportMenuOpen && (
                  <div className={`absolute bottom-full mb-2 w-56 rounded-xl shadow-2xl border animate-fade-in-up z-50 overflow-hidden ${isDarkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-gold/20'}`}>
                    <button onClick={() => handleDownloadAudio('wav')} className={`w-full text-right px-4 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gold/5'}`}>
                      <div className="text-stone-700 dark:text-stone-200"><div className="font-tajawal font-bold">WAV</div><div className="text-xs opacity-70">أعلى جودة</div></div>
                      <Download className="w-4 h-4 opacity-60" />
                    </button>
                    <button onClick={() => handleDownloadAudio('mp3')} className={`w-full text-right px-4 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gold/5'}`}>
                      <div className="text-stone-700 dark:text-stone-200"><div className="font-tajawal font-bold">MP3</div><div className="text-xs opacity-70">متوافق وشائع</div></div>
                      <Download className="w-4 h-4 opacity-60" />
                    </button>
                    <button onClick={() => handleDownloadAudio('aac')} className={`w-full text-right px-4 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gold/5'}`}>
                      <div className="text-stone-700 dark:text-stone-200"><div className="font-tajawal font-bold">AAC</div><div className="text-xs opacity-70">جودة عالية وحجم أقل</div></div>
                      <Download className="w-4 h-4 opacity-60" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 md:space-y-6 text-center relative z-10 mb-12 min-h-[200px]">
          {isEditing ? <textarea value={editVerses} onChange={(e) => setEditVerses(e.target.value)} className="w-full h-[400px] text-xl md:text-3xl font-amiri leading-[2.2] bg-white/40 border rounded-lg p-4 outline-none text-center" /> : currentPoem.verses.map((verse, idx) => (
            <div key={idx} className="relative group">
              <div onClick={() => setActiveVerseIndex(activeVerseIndex === idx ? null : idx)} className={`relative px-4 py-2 rounded-lg transition-all cursor-pointer border border-transparent ${activeVerseIndex === idx ? 'bg-gold/10 border-gold/20' : 'hover:bg-gold/5'}`}>
                 <p className="text-xl md:text-3xl font-amiri leading-relaxed whitespace-nowrap overflow-x-auto scrollbar-hide poem-verse-text">{verse}</p>
              </div>
            </div>
          ))}
        </div>

        {currentPoem.difficultWords && currentPoem.difficultWords.length > 0 && !isEditing && (
          <div className="mt-8 mb-8 mx-2 md:mx-8 p-6 rounded-lg border border-gold/20 bg-black/5 relative z-10">
            <h4 className="text-center font-amiri font-bold text-xl mb-6 flex items-center justify-center gap-3 text-deep-green"><Book className="w-5 h-5" /><span>معاني المفردات</span></h4>
            <div className="space-y-4" dir="rtl">
              {currentPoem.difficultWords.map((item, idx) => (
                <div key={idx} className="border-b border-gold/10 pb-3 last:border-0"><span className="block font-amiri font-bold text-lg text-gold-dark">{item.word}</span><p className="font-tajawal text-sm md:text-base text-stone-600">{item.meaning}</p></div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center relative z-10 mt-8 pt-6 border-t border-gold/20">
          <div className="font-amiri font-bold text-2xl md:text-3xl text-deep-green">الشاعر م . الكديري</div>
        </div>

        {!isEditing && (
          <div className={`mt-10 mb-8 mx-2 md:mx-8 p-6 rounded-xl border-2 border-dashed border-gold/20 relative z-10 ${isDarkMode ? 'bg-zinc-800/40' : 'bg-white/40'}`}>
            <div className="flex flex-col md:flex-row items-center gap-6 text-right" dir="rtl">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-gold/30 shrink-0 bg-gold/5"><User className="w-8 h-8 text-gold" /></div>
              <div>
                <h4 className="font-amiri font-bold text-lg mb-1 text-deep-green">عن الشاعر م . الكديري</h4>
                <p className="font-tajawal text-xs md:text-sm leading-relaxed text-stone-500">شاعر متخصص في نظم وصياغة الشعر العربي الفصيح، خبير في البحور الخليلية وفنون البلاغة والبيان، يهدف إلى إحياء التراث الأدبي العريق بلمسات معاصرة، موفراً لطلاب العلم ومحبي الأدب مادة شعرية نابضة بالفصاحة.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-6 mt-8 relative z-10 print:hidden" data-html2canvas-ignore>
          <div className="flex justify-center gap-4 flex-wrap w-full">
            {isEditing ? (
              <><button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 rounded-full bg-deep-green text-gold"><Check className="w-4 h-4" />حفظ</button><button onClick={handleCancelEditing} className="flex items-center gap-2 px-6 py-2 rounded-full border border-red-300 text-red-700"><X className="w-4 h-4" />إلغاء</button></>
            ) : (
              <div className="flex gap-4 items-center">
                <button onClick={onReset} className="flex items-center gap-2 px-5 py-2 rounded-full border border-deep-green text-deep-green font-tajawal hover:bg-deep-green hover:text-white transition-all"><RefreshCw className="w-4 h-4" />جديد</button>
                <button onClick={handleStartEditing} className="flex items-center gap-2 px-5 py-2 rounded-full border border-stone-400 text-stone-600 font-tajawal hover:bg-stone-100 transition-all"><Edit3 className="w-4 h-4" />تنقيح</button>
                <button onClick={() => { navigator.clipboard.writeText(currentPoem.verses.join('\n')); playSound('paper'); }} className="flex items-center gap-2 px-5 py-2 rounded-full border border-gold-dark text-gold-dark font-tajawal hover:bg-gold/10 transition-all"><Copy className="w-4 h-4" />نسخ</button>
                
                {/* Export Dropdown */}
                <div className="relative" ref={exportMenuRef}>
                  <button 
                    onClick={() => { setIsExportMenuOpen(!isExportMenuOpen); playSound('ink'); }}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-gold text-white font-tajawal hover:bg-gold-dark transition-all shadow-md disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>تحميل</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isExportMenuOpen && (
                    <div className={`absolute bottom-full mb-2 left-0 w-48 rounded-xl shadow-2xl border animate-fade-in-up z-50 overflow-hidden ${isDarkMode ? 'bg-zinc-800 border-white/10' : 'bg-white border-gold/20'}`}>
                      <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className={`w-full text-right px-4 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-white/5 text-stone-200' : 'hover:bg-gold/5 text-stone-700'}`}
                      >
                        <span className="font-tajawal">ملف PDF</span>
                        <Download className="w-4 h-4 opacity-60" />
                      </button>
                      <button 
                        onClick={handleExportText}
                        className={`w-full text-right px-4 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-white/5 text-stone-200' : 'hover:bg-gold/5 text-stone-700'}`}
                      >
                        <span className="font-tajawal">ملف نصي</span>
                        <FileText className="w-4 h-4 opacity-60" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center gap-6 pt-6 border-t border-gold/10 w-full justify-center">
              <span className="font-kufi text-xs text-stone-400">مشاركة:</span>
              <button onClick={() => handleShare('twitter')} className="text-stone-400 hover:text-black transition-colors transform hover:scale-110"><TwitterIcon className="w-5 h-5" /></button>
              <button onClick={() => handleShare('facebook')} className="text-stone-400 hover:text-[#1877F2] transition-colors transform hover:scale-110"><FacebookIcon className="w-5 h-5" /></button>
              <button onClick={() => handleShare('whatsapp')} className="text-stone-400 hover:text-[#25D366] transition-colors transform hover:scale-110"><WhatsAppIcon className="w-5 h-5" /></button>
            </div>
          )}
        </div>
        <button onClick={handleScrollToTop} data-html2canvas-ignore className={`fixed bottom-4 left-4 z-40 p-3 rounded-full shadow-lg transition-all duration-500 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'} ${isDarkMode ? 'bg-zinc-800 text-gold' : 'bg-white text-gold-dark border border-gold/30'}`}><ArrowUp className="w-5 h-5" /></button>
      </div>
    </div>
  );
};