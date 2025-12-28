import React, { useEffect, useState } from 'react';

const COMPOSE_MESSAGES = [
  "بري القلم بمهارة الأدباء وتجهيز الدواة...",
  "الغوص في بحور اللغة لانتقاء أندر الألفاظ...",
  "وزن الأبيات بميزان الذهب لضمان سلامة الإيقاع...",
  "استحضار المعاني السامية لتليق بمقامك...",
  "نحت القوافي لتأتي متناغمة كالدر المنظوم...",
  "التأمل في المعنى لصياغته في أبهى صورة...",
  "مراجعة عروض القصيدة وضربها بدقة متناهية...",
  "اختيار سحر البلاغة وعذب البيان...",
  "سكب الروح في الكلمات لتخرج القصيدة حية...",
  "وضع اللمسات الأخيرة على لوحتك الشعرية..."
];

const ANALYZE_MESSAGES = [
  "قراءة الأبيات بتمعن لاستيعاب المعنى...",
  "تقطيع الأبيات عروضياً لتحديد البحر...",
  "فحص القوافي والزحافات والعلل...",
  "استخراج الصور البلاغية والجمالية...",
  "التحقق من سلامة الوزن وانضباط الإيقاع...",
  "التأمل في عاطفة الشاعر وأغراضه...",
  "تحليل المفردات الصعبة وتفسيرها...",
  "إعداد التقرير النقدي النهائي..."
];

const TASHKEEL_MESSAGES = [
  "فحص بنية الكلمات والجمل...",
  "تطبيق القواعد النحوية والإعرابية بدقة...",
  "وضع الحركات على كل حرف حسب موقعه...",
  "مراجعة النص لضمان الضبط السليم...",
  "التحقق من علامات الترقيم وتأثيرها...",
  "إعداد النص المشكول للعرض..."
];

interface LoadingOverlayProps {
  mode: 'compose' | 'analyze' | 'tashkeel';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ mode }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = 
    mode === 'compose' ? COMPOSE_MESSAGES : 
    mode === 'analyze' ? ANALYZE_MESSAGES : 
    TASHKEEL_MESSAGES;

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 bg-parchment/95 backdrop-blur-md z-50 flex flex-col items-center justify-center text-deep-green">
      <div className="w-20 h-20 border-4 border-gold/30 border-t-deep-green rounded-full animate-spin mb-8"></div>
      
      <h3 className="text-3xl font-amiri font-bold mb-4 text-center px-4">
        {mode === 'compose' 
          ? "الشاعر م . الكديري ينظم لك القصيدة"
          : mode === 'analyze'
          ? "الشاعر م . الكديري يحلل قصيدتك"
          : "الخبير اللغوي يضبط لك النص"
        }
      </h3>
      
      <p className="text-xl font-kufi text-gold-dark animate-pulse text-center px-4 max-w-md leading-loose h-24 flex items-center justify-center">
        {messages[msgIndex]}
      </p>
      
      <p className="mt-8 text-lg font-tajawal text-stone-600 font-medium">
        {mode === 'compose'
          ? "أرجو الانتظار والتحلي بالصبر.. فالشعر الأصيل يحتاج إلى روية"
          : mode === 'analyze'
          ? "أرجو الانتظار قليلاً.. جاري فحص النصوص بدقة متناهية"
          : "أرجو الانتظار.. الدقة اللغوية تتطلب بعض الوقت"
        }
      </p>
    </div>
  );
};