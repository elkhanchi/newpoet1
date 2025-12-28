import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PoemForm } from './components/PoemForm';
import { PoemAnalyzer } from './components/PoemAnalyzer';
import { PoemImprover } from './components/PoemImprover';
import { FamousLibrary } from './components/FamousLibrary';
import { PoemDisplay } from './components/PoemDisplay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { LoginForm } from './components/LoginForm';
import { generatePoem, analyzePoem, fetchFamousPoem, improvePoem, addTashkeelToPoem } from './services/geminiService';
import { PoemRequest, PoemResponse } from './types';
import { useSoundSystem } from './hooks/useSoundSystem';
import { Volume2, VolumeX, PenTool, Search, Book, Sparkles, Edit } from 'lucide-react';
import { PoemTashkeel } from './components/PoemTashkeel';
import { RecentPoems } from './components/RecentPoems';
import { InstallPWAButton } from './components/InstallPWAButton';

type Mode = 'compose' | 'analyze' | 'improve' | 'tashkeel' | 'library';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [poem, setPoem] = useState<PoemResponse | null>(null);
  const [history, setHistory] = useState<PoemResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('compose');
  
  // Sound System
  const { isMuted, toggleMute, playSound } = useSoundSystem();
  
  // Auth state
  const [tryCount, setTryCount] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const savedTries = localStorage.getItem('poem_tries');
    if (savedTries) setTryCount(parseInt(savedTries, 10));
    
    const savedHistory = localStorage.getItem('poem_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse poem history", e);
      }
    }

    const sessionAuth = sessionStorage.getItem('is_logged_in');
    if (sessionAuth === 'true') setIsLoggedIn(true);
  }, []);

  const addToHistory = useCallback((newPoem: PoemResponse) => {
    setHistory(prev => {
      const filtered = prev.filter(p => p.title !== newPoem.title);
      const updated = [newPoem, ...filtered].slice(0, 50);
      localStorage.setItem('poem_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleModeChange = (newMode: Mode) => {
    if (newMode !== mode) {
      playSound('paper');
      setMode(newMode);
      setPoem(null);
      setError(null);
    }
  };

  const handlePoemRequest = useCallback(async (request: PoemRequest) => {
    if (!navigator.onLine) {
      setError("عذراً، أنت غير متصل بالإنترنت. هذه الوظيفة تتطلب اتصالاً بالشبكة.");
      return;
    }
    if (!isLoggedIn && tryCount >= 2) {
      setShowLogin(true);
      return;
    }
    playSound('ink');
    setIsLoading(true);
    setError(null);
    try {
      const generatedPoem = await generatePoem(request);
      setPoem(generatedPoem);
      addToHistory(generatedPoem);
      playSound('paper');
      if (!isLoggedIn) {
        const newCount = tryCount + 1;
        setTryCount(newCount);
        localStorage.setItem('poem_tries', newCount.toString());
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, tryCount, playSound, addToHistory]);

  const handleAnalyzeRequest = useCallback(async (text: string) => {
    if (!navigator.onLine) {
      setError("عذراً، أنت غير متصل بالإنترنت. هذه الوظيفة تتطلب اتصالاً بالشبكة.");
      return;
    }
    playSound('ink');
    setIsLoading(true);
    setError(null);
    try {
      const analyzedPoem = await analyzePoem(text);
      setPoem(analyzedPoem);
      addToHistory(analyzedPoem);
      playSound('paper');
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء التحليل");
    } finally {
      setIsLoading(false);
    }
  }, [playSound, addToHistory]);

  const handleImproveRequest = useCallback(async (text: string) => {
    if (!navigator.onLine) {
      setError("عذراً، أنت غير متصل بالإنترنت. هذه الوظيفة تتطلب اتصالاً بالشبكة.");
      return;
    }
    playSound('ink');
    setIsLoading(true);
    setError(null);
    try {
      const improved = await improvePoem(text);
      setPoem(improved);
      addToHistory(improved);
      playSound('paper');
    } catch (err: any) {
      setError(err.message || "فشل في تحسين القصيدة");
    } finally {
      setIsLoading(false);
    }
  }, [playSound, addToHistory]);

  const handleTashkeelRequest = useCallback(async (text: string) => {
    if (!navigator.onLine) {
      setError("عذراً، أنت غير متصل بالإنترنت. هذه الوظيفة تتطلب اتصالاً بالشبكة.");
      return;
    }
    playSound('ink');
    setIsLoading(true);
    setError(null);
    try {
      const tashkeeled = await addTashkeelToPoem(text);
      setPoem(tashkeeled);
      addToHistory(tashkeeled);
      playSound('paper');
    } catch (err: any) {
      setError(err.message || "فشل في تشكيل القصيدة");
    } finally {
      setIsLoading(false);
    }
  }, [playSound, addToHistory]);

  const handleSelectFamous = useCallback(async (poetName: string, poemDescription: string) => {
    if (!navigator.onLine) {
      setError("عذراً، أنت غير متصل بالإنترنت. هذه الوظيفة تتطلب اتصالاً بالشبكة.");
      return;
    }
    playSound('ink');
    setIsLoading(true);
    setError(null);
    try {
      const famousPoem = await fetchFamousPoem(poetName, poemDescription);
      setPoem(famousPoem);
      addToHistory(famousPoem);
      playSound('paper');
    } catch (err: any) {
      setError(err.message || "تعذر جلب القصيدة");
    } finally {
      setIsLoading(false);
    }
  }, [playSound, addToHistory]);

  const handleReset = useCallback(() => {
    playSound('paper');
    setPoem(null);
    setError(null);
  }, [playSound]);

  const handleSelectHistory = useCallback((selectedPoem: PoemResponse) => {
    playSound('paper');
    setPoem(selectedPoem);
    addToHistory(selectedPoem);
  }, [playSound, addToHistory]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    sessionStorage.setItem('is_logged_in', 'true');
    playSound('chime');
  };

  return (
    <div className="min-h-screen bg-parchment bg-islamic-pattern bg-blend-overlay flex flex-col relative">
      {isLoading && <LoadingOverlay mode={mode === 'tashkeel' ? 'tashkeel' : (mode === 'analyze' || mode === 'library' ? 'analyze' : 'compose')} />}
      
      {showLogin && (
        <LoginForm onLogin={handleLoginSuccess} onCancel={() => setShowLogin(false)} />
      )}
      
      <Header />

      <button
        onClick={toggleMute}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-deep-green text-gold shadow-lg hover:bg-emerald-900 transition-all duration-300 border border-gold/30"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      <InstallPWAButton />

      <main className="flex-grow px-4 py-8 max-w-5xl mx-auto w-full relative z-10">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-center font-tajawal">
            {error}
            <button onClick={() => setError(null)} className="block mx-auto mt-2 underline text-xs">إخفاء</button>
          </div>
        )}

        {!poem && (
          <div className="flex justify-center mb-12 animate-fade-in-up">
            <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-gold/30 flex shadow-sm gap-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleModeChange('compose')}
                className={`px-5 py-2.5 rounded-full font-amiri font-bold text-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  mode === 'compose' ? 'bg-deep-green text-gold shadow-md' : 'text-stone-600 hover:bg-white/50'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>نظم</span>
              </button>
              <button
                onClick={() => handleModeChange('analyze')}
                className={`px-5 py-2.5 rounded-full font-amiri font-bold text-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  mode === 'analyze' ? 'bg-deep-green text-gold shadow-md' : 'text-stone-600 hover:bg-white/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>تحليل</span>
              </button>
              <button
                onClick={() => handleModeChange('improve')}
                className={`px-5 py-2.5 rounded-full font-amiri font-bold text-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  mode === 'improve' ? 'bg-deep-green text-gold shadow-md' : 'text-stone-600 hover:bg-white/50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>تحسين</span>
              </button>
              <button
                onClick={() => handleModeChange('tashkeel')}
                className={`px-5 py-2.5 rounded-full font-amiri font-bold text-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  mode === 'tashkeel' ? 'bg-deep-green text-gold shadow-md' : 'text-stone-600 hover:bg-white/50'
                }`}
              >
                <Edit className="w-4 h-4" />
                <span>تشكيل</span>
              </button>
              <button
                onClick={() => handleModeChange('library')}
                className={`px-5 py-2.5 rounded-full font-amiri font-bold text-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  mode === 'library' ? 'bg-deep-green text-gold shadow-md' : 'text-stone-600 hover:bg-white/50'
                }`}
              >
                <Book className="w-4 h-4" />
                <span>مكتبة الروائع</span>
              </button>
            </div>
          </div>
        )}

        {!poem ? (
          <div className="animate-fade-in-up">
            {mode === 'compose' && <PoemForm onSubmit={handlePoemRequest} isLoading={isLoading} playSound={playSound} />}
            {mode === 'analyze' && <PoemAnalyzer onAnalyze={handleAnalyzeRequest} isLoading={isLoading} playSound={playSound} />}
            {mode === 'improve' && <PoemImprover onImprove={handleImproveRequest} isLoading={isLoading} playSound={playSound} />}
            {mode === 'tashkeel' && <PoemTashkeel onTashkeel={handleTashkeelRequest} isLoading={isLoading} playSound={playSound} />}
            {mode === 'library' && <FamousLibrary onSelect={handleSelectFamous} playSound={playSound} />}
            
            {mode !== 'library' && (
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center opacity-80">
                <div className="p-4"><h3 className="font-amiri text-2xl text-deep-green mb-2">أصالة الكلمة</h3><p className="font-tajawal text-stone-600">أكتب بلسان عربي مبين، محافظاً على تراثنا.</p></div>
                <div className="p-4"><h3 className="font-amiri text-2xl text-deep-green mb-2">إتقان الوزن</h3><p className="font-tajawal text-stone-600">أراعي بحور الشعر وقوافيه بدقة.</p></div>
                <div className="p-4"><h3 className="font-amiri text-2xl text-deep-green mb-2">صدق المشاعر</h3><p className="font-tajawal text-stone-600">أصوغ مشاعرك في أبيات تلامس القلوب.</p></div>
              </div>
            )}

            {history.length > 0 && (
              <RecentPoems poems={history} onSelect={handleSelectHistory} playSound={playSound} />
            )}
          </div>
        ) : (
          <PoemDisplay 
            poem={poem} 
            onReset={handleReset} 
            playSound={playSound} 
            history={history}
            onSelectHistory={handleSelectHistory}
          />
        )}
      </main>

      <footer className="py-6 text-center text-stone-500 font-kufi text-sm border-t border-gold/10 bg-parchment-dark/50">
        <p>© 2025 جميع الحقوق محفوظة للشاعر الرقمي م . الكديري</p>
      </footer>
    </div>
  );
}

export default App;