import React, { useState } from 'react';
import { Book, Bookmark, Library, Star, Scroll, Award } from 'lucide-react';
import { SoundType } from '../hooks/useSoundSystem';

interface PoemEntry {
  poet: string;
  title: string;
  description: string;
  category: 'muallaqat' | 'wisdom' | 'love' | 'others';
}

const FAMOUS_POEMS: PoemEntry[] = [
  { poet: 'امرؤ القيس', title: 'قفا نبكِ', description: 'معلقة امرؤ القيس "قفا نبك من ذكرى حبيب ومنزل"', category: 'muallaqat' },
  { poet: 'طرفة بن العبد', title: 'لخولة أطلال', description: 'معلقة طرفة بن العبد "لخولة أطلال ببرقة ثهمد"', category: 'muallaqat' },
  { poet: 'زهير بن أبي سلمى', title: 'أمن أم أوفى', description: 'معلقة زهير بن أبي سلمى "أمن أم أوفى دمنة لم تكلم"', category: 'muallaqat' },
  { poet: 'عنترة بن شداد', title: 'هل غادر الشعراء', description: 'معلقة عنترة بن شداد "هل غادر الشعراء من متردم"', category: 'muallaqat' },
  { poet: 'عمرو بن كلثوم', title: 'ألا هبي بصحنك', description: 'معلقة عمرو بن كلثوم "ألا هبي بصحنك فاصبحينا"', category: 'muallaqat' },
  { poet: 'لبيد بن ربيعة', title: 'عفت الديار', description: 'معلقة لبيد بن ربيعة "عفت الديار محلها فمقامها"', category: 'muallaqat' },
  { poet: 'الحارث بن حلزة', title: 'آذنتنا ببينها', description: 'معلقة الحارث بن حلزة "آذنتنا ببينها أسماء"', category: 'muallaqat' },
  { poet: 'المتنبي', title: 'واحر قلباه', description: 'قصيدة المتنبي في عتاب سيف الدولة "واحر قلباه ممن قلبه شبم"', category: 'others' },
  { poet: 'المتنبي', title: 'الخيل والليل', description: 'قصيدة المتنبي "الخيل والليل والبيداء تعرفني"', category: 'others' },
  { poet: 'أبو تمام', title: 'فتح عمورية', description: 'قصيدة أبو تمام "السيف أصدق أنباء من الكتب"', category: 'wisdom' },
  { poet: 'أبو البقاء الرندي', title: 'لكل شيء إذا ما تم نقصان', description: 'مرثية الأندلس الشهيرة', category: 'wisdom' },
  { poet: 'قيس بن الملوح', title: 'المؤنسة', description: 'قصيدة مجنون ليلى الشهيرة "تذكرت ليلى والسنين الخواليا"', category: 'love' },
];

interface FamousLibraryProps {
  onSelect: (poet: string, desc: string) => void;
  playSound: (type: SoundType) => void;
}

export const FamousLibrary: React.FC<FamousLibraryProps> = ({ onSelect, playSound }) => {
  const [activeTab, setActiveTab] = useState<PoemEntry['category']>('muallaqat');

  const tabs = [
    { id: 'muallaqat', label: 'المعلقات السبع', icon: <Award className="w-4 h-4" /> },
    { id: 'wisdom', label: 'شعر الحكمة', icon: <Star className="w-4 h-4" /> },
    { id: 'love', label: 'روائع الغزل', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'others', label: 'فرائد أخرى', icon: <Scroll className="w-4 h-4" /> },
  ];

  const filteredPoems = FAMOUS_POEMS.filter(p => p.category === activeTab);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/60 backdrop-blur-sm border border-gold/30 rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden animate-fade-in-up">
      <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-gold opacity-30 rounded-tr-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold opacity-30 rounded-bl-2xl"></div>

      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-amiri font-bold text-deep-green flex items-center justify-center gap-4 mb-3">
          <Library className="text-gold w-8 h-8" />
          <span>مكتبة الروائع الخالدة</span>
          <Library className="text-gold w-8 h-8 scale-x-[-1]" />
        </h2>
        <p className="font-tajawal text-stone-600">استعرض كنوز الأدب العربي وحلل عيون الشعر بلمسة واحدة</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-gold/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              playSound('ink');
            }}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full font-amiri font-bold text-lg transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-deep-green text-gold shadow-lg transform -translate-y-1' 
                : 'text-stone-500 hover:text-deep-green hover:bg-gold/5'}
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPoems.map((poem, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(poem.poet, poem.description)}
            className="group relative bg-parchment/50 border border-gold/20 rounded-xl p-5 text-right hover:border-gold hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute -left-4 -top-4 w-12 h-12 bg-gold/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <span className="inline-block px-2 py-0.5 bg-gold/10 text-gold-dark text-[10px] font-bold rounded mb-2 font-kufi">
                {poem.poet}
              </span>
              <h3 className="text-xl font-amiri font-bold text-deep-green mb-1 group-hover:text-gold-dark transition-colors">
                {poem.title}
              </h3>
              <p className="text-xs font-tajawal text-stone-500 line-clamp-2">
                {poem.description}
              </p>
            </div>
            
            <div className="mt-4 flex justify-end">
              <div className="text-gold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold font-tajawal">
                <span>عرض وتحليل</span>
                <Scroll className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center p-6 bg-deep-green/5 rounded-xl border border-gold/10">
        <p className="font-tajawal text-sm text-stone-600 italic">
          "إن من البيان لسحراً، وإن من الشعر لحكمة" - نجمع لك نفائس الكلم لتكتشف أسرار لغة الضاد.
        </p>
      </div>
    </div>
  );
};