// OpenAI API configuration
import OpenAI from 'openai';

// Environment variable approach (most secure)
// In production, this should be handled by a backend service
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
});

// Add a warning if API key is not set
if (!apiKey) {
  console.warn('OpenAI API key is not set. Please set VITE_OPENAI_API_KEY in your environment variables.');
}

// Function to generate dynamic clues
export const generateDynamicClue = async (destination) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a travel expert. Generate one interesting and unique clue about this destination that would help someone guess it in a geography game. Keep it concise (under 15 words)."
        },
        {
          role: "user",
          content: `Generate a clue for ${destination.city}, ${destination.country}.`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating clue with OpenAI:', error);
    return null;
  }
};

// Function to generate enhanced bonus questions
export const generateBonusQuestion = async (emojiSet, destinations) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are creating a geography quiz. Generate a multiple-choice question based on these destinations with 4 options and indicate the correct answer index (0-3). Format your response as JSON with fields: question, options (array), correct_answer (number 0-3)."
        },
        {
          role: "user",
          content: `Create a question about these destinations: ${destinations.join(', ')}. Emojis collected: ${emojiSet.join(' ')}`
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });
    
    // Try to parse the response as JSON
    try {
      const content = response.choices[0].message.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          question: parsedResponse.question,
          options: parsedResponse.options,
          correct_answer: parsedResponse.correct_answer
        };
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
    }
    
    // Fallback if parsing fails
    return {
      question: "What do these destinations have in common?",
      options: ["They're all coastal cities", "They all have famous museums", "They're all capital cities", "They all have historic landmarks"],
      correct_answer: 3
    };
  } catch (error) {
    console.error('Error generating bonus question with OpenAI:', error);
    return null;
  }
};

// Function to generate fun facts
export const generateFunFact = async (destination) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a travel expert. Generate one surprising and interesting fun fact about this destination that most people wouldn't know. Keep it concise (under 20 words)."
        },
        {
          role: "user",
          content: `Generate a fun fact for ${destination.city}, ${destination.country}.`
        }
      ],
      max_tokens: 60,
      temperature: 0.8,
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating fun fact with OpenAI:', error);
    return null;
  }
};

// Rate limiting to prevent excessive API usage
let lastCallTime = 0;
const minTimeBetweenCalls = 1000; // 1 second

export const rateLimitedCall = async (apiFunction, ...args) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;
  
  if (timeSinceLastCall < minTimeBetweenCalls) {
    await new Promise(resolve => setTimeout(resolve, minTimeBetweenCalls - timeSinceLastCall));
  }
  
  lastCallTime = Date.now();
  return apiFunction(...args);
};

export default openai;
