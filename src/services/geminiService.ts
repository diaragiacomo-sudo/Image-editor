import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateAIImage = async (prompt: string, style: string, aspectRatio: string = "1:1") => {
  try {
    const ai = getAI();
    const fullPrompt = `${prompt}${style ? `. Style: ${style}` : ''}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

export const editImageWithAI = async (base64Image: string, instruction: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: "image/png",
            },
          },
          {
            text: instruction,
          },
        ],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image data returned from Gemini");
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};
