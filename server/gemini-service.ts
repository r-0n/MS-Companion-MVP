interface ChatContext {
  recentMetrics?: {
    sleepQuality: number;
    sleepDuration: number;
    fatigueLevel: number;
    moodScore: number;
    activitySteps: number;
    riskScore?: number;
    riskCategory?: string;
  };
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

async function callGeminiAPI(messages: any[], systemInstruction: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: messages,
        generation_config: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help. Could you tell me more?";
}

export async function generateAIResponse(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  const systemInstruction = `You are a compassionate health companion for people with Multiple Sclerosis (MS). 

Your role is to:
- Provide emotional support and encouragement
- Answer questions about MS symptoms, lifestyle, and management
- Interpret health metrics and risk assessments in a caring, non-alarming way
- Suggest wellness activities and coping strategies
- Remember conversation context and be adaptive to user's situation

Guidelines:
- Be warm, empathetic, and reassuring
- Never provide medical diagnoses or replace professional medical advice
- When discussing health metrics, frame information constructively
- Encourage healthy habits without being preachy
- If risk is high, gently suggest consulting healthcare provider

${
  context.recentMetrics
    ? `\nCurrent Health Context:
- Sleep Quality: ${context.recentMetrics.sleepQuality}/5
- Sleep Duration: ${context.recentMetrics.sleepDuration} hours
- Fatigue Level: ${context.recentMetrics.fatigueLevel}/5
- Mood: ${context.recentMetrics.moodScore}/5
- Activity: ${context.recentMetrics.activitySteps} steps
${
  context.recentMetrics.riskScore
    ? `- Risk Assessment: ${context.recentMetrics.riskScore}% (${context.recentMetrics.riskCategory})`
    : ""
}`
    : ""
}`;

  const conversationMessages = context.conversationHistory
    .slice(-10)
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  conversationMessages.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  return await callGeminiAPI(conversationMessages, systemInstruction);
}

export async function generatePersonalizedSuggestion(
  riskCategory: string,
  metrics: {
    sleepQuality: number;
    sleepDuration: number;
    fatigueLevel: number;
    moodScore: number;
    activitySteps: number;
  }
): Promise<string> {
  const prompt = `Based on these health metrics for an MS patient:
- Risk Level: ${riskCategory}
- Sleep Quality: ${metrics.sleepQuality}/5
- Sleep Duration: ${metrics.sleepDuration} hours
- Fatigue: ${metrics.fatigueLevel}/5
- Mood: ${metrics.moodScore}/5
- Activity: ${metrics.activitySteps} steps

Generate a brief, encouraging personalized health suggestion (2-3 sentences max). Focus on the most concerning metric.`;

  const messages = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  try {
    return await callGeminiAPI(messages, "You are a compassionate MS health advisor.");
  } catch (error) {
    return "Take care of yourself today. Rest when needed and stay hydrated.";
  }
}
