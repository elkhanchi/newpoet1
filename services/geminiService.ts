import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PoemRequest, PoemResponse } from "../types";

// FIX: Removed getApiKey function to adhere to coding guidelines, which mandate using process.env.API_KEY directly.
// This also resolves the TypeScript error `Property 'env' does not exist on type 'ImportMeta'`.

const ARABIC_ONLY_INSTRUCTION = "يجب أن تكون جميع المخرجات باللغة العربية الفصحى حصراً. لا تستخدم اللغة الإنجليزية. يجب تشكيل أبيات الشعر بالحركات كاملةً. في القصيدة، قدم كل بيت كاملاً في سلسلة نصية واحدة يفصل فيها بين الصدر والعجز علامة ' ... '. بالنسبة لقسم `difficultWords`، يجب أن يكون قائمة تحتوي على كائنات منفصلة، كل كائن يمثل كلمة صعبة واحدة ومعناها الموجز. لا تدمج جميع الشروحات في فقرة واحدة طويلة أو في معنى واحد.";

export const generatePoem = async (request: PoemRequest): Promise<PoemResponse> => {
  // FIX: Adhering to the coding guidelines to use process.env.API_KEY for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `أنت شاعر عربي فحل من شعراء العصر الذهبي. مهمتك نظم قصائد عمودية موزونة ومقفاة بدقة مع الضبط التام والكامل بالشكل. التزم باللغة الفصحى والبحور الخليلية. ${ARABIC_ONLY_INSTRUCTION}`;
  const userPrompt = `الموضوع: ${request.topic}. الغرض: ${request.mood}. البحر: ${request.meter}. عدد الأبيات: ${request.verseCount || '6-12'}. المهدى إليه: ${request.recipient || 'عام'}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            verses: { type: Type.ARRAY, items: { type: Type.STRING } },
            meterUsed: { type: Type.STRING },
            difficultWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING } }
              }
            }
          },
          required: ["title", "verses", "meterUsed"],
        },
      },
    });
    const poemData = JSON.parse(response.text);
    return { ...poemData, createdAt: new Date().toISOString() } as PoemResponse;
  } catch (error) {
    throw new Error("جف حبر القلم، حاول مرة أخرى.");
  }
};

export const improvePoem = async (text: string): Promise<PoemResponse> => {
  // FIX: Adhering to the coding guidelines to use process.env.API_KEY for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `أنت بروفيسور في الأدب العربي وخبير في العروض والقافية. مهمتك استلام مسودة قصيدة من مستخدم وتحسينها: قم بتصحيح أي كسر في الوزن، تقوية القافية، استبدال الكلمات الركيكة بألفاظ جزلة وفصيحة، مع الحفاظ التام على روح القصيدة وفكرتها الأصلية. ${ARABIC_ONLY_INSTRUCTION}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `هذه مسودة لقصيدة، أرجو تهذيبها وتحسينها وزناً وقافية ولغة: \n\n ${text}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            verses: { type: Type.ARRAY, items: { type: Type.STRING } },
            meterUsed: { type: Type.STRING },
            difficultWords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING } } } },
            critique: { type: Type.STRING, description: "شرح للتغييرات التي أجريتها ولماذا القصيدة الآن أفضل" }
          },
          required: ["title", "verses", "meterUsed", "critique"],
        },
      },
    });
    const poemData = JSON.parse(response.text);
    return { ...poemData, createdAt: new Date().toISOString() } as PoemResponse;
  } catch (error) {
    throw new Error("تعذر تحسين النص، تأكد من جودة المسودة.");
  }
};

export const addTashkeelToPoem = async (text: string): Promise<PoemResponse> => {
  // FIX: Adhering to the coding guidelines to use process.env.API_KEY for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `أنت خبير في اللغة العربية والنحو والصرف. مهمتك الأساسية هي إضافة التشكيل (الحركات) الكامل والدقيق على النص العربي المُعطى. لا تغير أياً من كلمات النص الأصلي، فقط قم بضبطه بالشكل التام. ${ARABIC_ONLY_INSTRUCTION}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `قم بتشكيل النص التالي تشكيلاً كاملاً ودقيقاً: \n\n ${text}`,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "عنوان مناسب للنص المشكول، أو 'نص مشكول'" },
            verses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "النص الأصلي بعد إضافة التشكيل الكامل عليه، كل بيت في عنصر منفصل." },
            meterUsed: { type: Type.STRING, description: "اكتب 'نص مشكول'" },
          },
          required: ["title", "verses", "meterUsed"],
        },
      },
    });
    const poemData = JSON.parse(response.text);
    return { ...poemData, createdAt: new Date().toISOString() } as PoemResponse;
  } catch (error) {
    throw new Error("تعذر تشكيل النص، يرجى المحاولة مرة أخرى.");
  }
};

export const synthesizePoem = async (text: string): Promise<string> => {
  // FIX: The `generateSpeech` guideline specifies initializing without an API key.
  const ai = new GoogleGenAI({});
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Charon' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("فشل توليد الصوت.");
  return base64Audio;
};

export const analyzePoem = async (text: string): Promise<PoemResponse> => {
  // FIX: Adhering to the coding guidelines to use process.env.API_KEY for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `أنت ناقد أدبي وعروضي خبير. حلل النص بدقة مع ضبط الكلمات بالشكل. ${ARABIC_ONLY_INSTRUCTION}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            verses: { type: Type.ARRAY, items: { type: Type.STRING } },
            meterUsed: { type: Type.STRING },
            difficultWords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING } } } },
            critique: { type: Type.STRING },
            meterAnalysis: { type: Type.STRING }
          },
          required: ["title", "verses", "meterUsed", "critique", "meterAnalysis"],
        },
      },
    });
    const poemData = JSON.parse(response.text);
    return { ...poemData, createdAt: new Date().toISOString() } as PoemResponse;
  } catch (error) {
    throw new Error("تعذر تحليل النص.");
  }
};

export const fetchFamousPoem = async (poet: string, poemDesc: string): Promise<PoemResponse> => {
  // FIX: Adhering to the coding guidelines to use process.env.API_KEY for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `أنت موسوعة أدبية حية. استخرج النص الأصلي الكامل للقصيدة المطلوبة مضبوطاً بالشكل التام. ${ARABIC_ONLY_INSTRUCTION}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `الشاعر: ${poet}. القصيدة: ${poemDesc}. استخرج النص بدقة ومشكولاً.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            verses: { type: Type.ARRAY, items: { type: Type.STRING } },
            meterUsed: { type: Type.STRING },
            difficultWords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING } } } },
            critique: { type: Type.STRING },
            meterAnalysis: { type: Type.STRING }
          },
          required: ["title", "verses", "meterUsed", "critique", "meterAnalysis"],
        },
      },
    });
    const poemData = JSON.parse(response.text);
    return { ...poemData, createdAt: new Date().toISOString() } as PoemResponse;
  } catch (error) {
    throw new Error("تعذر استحضار القصيدة من المكتبة.");
  }
};

export const explainVerse = async (verse: string, allVerses: string[]): Promise<string> => {
  // FIX: Adhering to the coding guidelines to use process.env.API_KEY for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `البيت: ${verse}. السياق: ${allVerses.join('\n')}. اشرح البيت شرحاً أدبياً موجزاً باللغة العربية الفصحى فقط وبشكل مضبوط.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { systemInstruction: "أنت ناقد أدبي خبير. اشرح بالعربية الفصحى حصراً." },
    });
    return response.text || "لا يوجد شرح.";
  } catch (error) {
    return "خطأ في جلب الشرح.";
  }
};
