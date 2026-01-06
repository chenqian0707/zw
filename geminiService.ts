
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChartAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeChartImage = async (base64Image: string): Promise<ChartAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    你是一位精通紫微斗数的资深命理大师。你擅长从复杂的命盘图像中提取信息。
    
    请根据提供的紫微斗数命盘截图，识别并生成结构化的分析：
    1. 个人基本信息（出生日期、性别、命主、身主）。
    2. 命宫、财帛宫、官禄宫、夫妻宫等主要宫位的星曜组合解析。
    3. **重点分析：大运（大限）与流年**。
       - 识别当前所在的大运周期（如：32-41岁）及其核心运势走向。
       - 识别当前及未来两年的流年（如：2024甲辰年、2025乙巳年）的具体运势特征。
    4. 提供关于事业、财富、感情的专业建议。
    
    输出必须为严格的 JSON 格式，且包含 decadeCycles 和 yearlyCycles 数组。
  `;

  const prompt = "请详细解读这张紫微斗数命盘，特别要列出大运（大限）和流年的具体解读。";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      personalInfo: {
        type: Type.OBJECT,
        properties: {
          birthDate: { type: Type.STRING },
          gender: { type: Type.STRING },
          mingZhu: { type: Type.STRING },
          shenZhu: { type: Type.STRING }
        },
        required: ["birthDate", "gender", "mingZhu", "shenZhu"]
      },
      summary: { type: Type.STRING },
      fortuneCycle: { type: Type.STRING },
      decadeCycles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            period: { type: Type.STRING, description: "如：32-41岁" },
            palaceName: { type: Type.STRING, description: "当前大限所在的宫位" },
            summary: { type: Type.STRING, description: "该十年的总体运势概括" }
          },
          required: ["period", "palaceName", "summary"]
        }
      },
      yearlyCycles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING, description: "如：2024 甲辰年" },
            summary: { type: Type.STRING, description: "该年份的运势详解" },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "当年的关键注意点" }
          },
          required: ["year", "summary", "keyPoints"]
        }
      },
      palaces: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            mainStars: { type: Type.ARRAY, items: { type: Type.STRING } },
            minorStars: { type: Type.ARRAY, items: { type: Type.STRING } },
            interpretation: { type: Type.STRING }
          }
        }
      },
      careerAdvice: { type: Type.STRING },
      wealthAdvice: { type: Type.STRING },
      relationshipAdvice: { type: Type.STRING }
    },
    required: ["personalInfo", "summary", "fortuneCycle", "decadeCycles", "yearlyCycles", "palaces", "careerAdvice", "wealthAdvice", "relationshipAdvice"]
  };

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1] || base64Image
    }
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const resultText = response.text || "{}";
    return JSON.parse(resultText) as ChartAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("分析过程中发生错误，请重试。");
  }
};
