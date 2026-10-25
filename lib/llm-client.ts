/**
 * Server-only unified LLM completion client
 * Routes to Groq (openai/gpt-oss-120b) with transparent fallback to Gemini
 */

import { getGroqConfig } from "./config";
import { GoogleGenAI } from "@google/genai";
import { requireGemini } from "./config";

export async function generateLLMCompletion(params: {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const { systemPrompt, userPrompt, jsonMode = false, temperature = 0.2 } = params;

  // 1. Try Groq first if configured
  const groqConfig = getGroqConfig();
  if (groqConfig.isConfigured && groqConfig.apiKey) {
    const candidateModels = [
      groqConfig.model,
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    for (const model of candidateModels) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
            temperature,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content.trim();
        }
      } catch (groqErr) {
        console.warn(`[LLM Client] Groq attempt (${model}) failed:`, groqErr);
      }
    }
  }

  // 2. Fallback to Gemini
  try {
    const geminiConf = requireGemini();
    const ai = new GoogleGenAI({ apiKey: geminiConf.apiKey });
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const res = await ai.models.generateContent({
      model: geminiConf.model,
      contents: fullPrompt,
      config: {
        temperature,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    });

    const text = typeof (res as unknown as { text: unknown }).text === "function"
      ? (res as unknown as { text: () => string }).text()
      : (res as unknown as { text: string }).text;
    if (text) return text.trim();
  } catch (geminiErr) {
    console.error("[LLM Client] Gemini fallback also failed:", geminiErr);
    throw geminiErr;
  }

  throw new Error("No response received from AI engine.");
}
