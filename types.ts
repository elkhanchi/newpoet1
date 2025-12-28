export enum PoemMood {
  Praise = 'مدح',
  Love = 'غزل',
  Sorrow = 'رثاء',
  Wisdom = 'حكمة',
  Pride = 'فخر',
  Descriptive = 'وصف',
  Satire = 'هجاء', // Use carefully
  Spiritual = 'زهد'
}

export enum PoemMeter {
  Any = 'على سليقتك',
  Tawil = 'البحر الطويل',
  Madid = 'البحر المديد',
  Basit = 'البحر البسيط',
  Wafir = 'البحر الوافر',
  Kamil = 'البحر الكامل',
  Hazaj = 'بحر الهزج',
  Rajaz = 'بحر الرجز',
  Ramal = 'بحر الرمل',
  Sari = 'البحر السريع',
  Munsarih = 'البحر المنسرح',
  Khafif = 'البحر الخفيف',
  Mudari = 'البحر المضارع',
  Muqtadab = 'البحر المقتضب',
  Mujtath = 'البحر المجتث',
  Mutaqarib = 'البحر المتقارب',
  Mutadarak = 'البحر المتدارك'
}

export interface PoemRequest {
  topic: string;
  mood: PoemMood;
  recipient?: string;
  meter?: PoemMeter;
  verseCount?: number;
}

export interface Vocabulary {
  word: string;
  meaning: string;
}

export interface PoemResponse {
  title: string;
  verses: string[];
  meterUsed: string;
  createdAt: string;
  difficultWords?: Vocabulary[];
  critique?: string; // General analysis/critique
  meterAnalysis?: string; // Detailed prosody/scansion analysis
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}