import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request for authentication
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-deep-green/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-parchment border-2 border-gold rounded-xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-fade-in-up">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold via-yellow-400 to-gold"></div>
        
        <button 
          onClick={onCancel}
          className="absolute top-4 left-4 text-stone-400 hover:text-red-500 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-deep-green mb-4 border border-gold/30">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-amiri font-bold text-deep-green mb-2">تسجيل الدخول</h2>
          <p className="text-stone-600 font-tajawal text-sm leading-relaxed">
            لقد استنفذت محاولاتك المجانية (2/2). <br/>
            سجل دخولك لتتابع رحلتك الشعرية مع الشاعر الرقمي م . الكديري.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-right text-deep-green font-bold font-tajawal mb-2 text-sm">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white/50 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-right font-tajawal transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-right text-deep-green font-bold font-tajawal mb-2 text-sm">كلمة المرور</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white/50 focus:border-gold focus:ring-1 focus:ring-gold outline-none text-right font-tajawal transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-deep-green text-gold hover:bg-emerald-900 hover:text-white font-bold font-tajawal rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gold/50 border-t-gold rounded-full animate-spin"></span>
                جارٍ التحقق...
              </span>
            ) : 'دخول'}
          </button>
        </form>
        
        <div className="mt-6 text-center pt-4 border-t border-stone-200">
          <p className="text-sm text-stone-500 font-tajawal">
            ليس لديك حساب؟ <button type="button" className="text-gold-dark hover:text-deep-green font-bold underline transition-colors">أنشئ حساباً جديداً</button>
          </p>
        </div>
      </div>
    </div>
  );
};