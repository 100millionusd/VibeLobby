import { GoogleGenAI } from "@google/genai";
import { ScoredHotel, ActivityTag } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Maps a custom user input (e.g., "Raving", "Crossfit") to the closest existing
 * category in our database (e.g., "Techno", "Gym") to ensure search results are found.
 */
export const findBestMatchingVibe = async (
  customInput: string, 
  availableTags: ActivityTag[]
): Promise<{ matchedLabel: string; reasoning: string } | null> => {
  if (!ai) return null;

  const tagLabels = availableTags.map(t => t.label).join(', ');

  const prompt = `
    You are a semantic search engine for a social hotel app.
    
    Database Categories: [${tagLabels}]
    User Search Query: "${customInput}"
    
    Task: Identify which Database Category is the closest semantic match for the User Search Query.
    
    Rules:
    1. If the User Search Query is very similar to a category (e.g. "Raving" -> "Techno"), pick it.
    2. If it is loosely related (e.g. "Meditation" -> "Yoga"), pick it.
    3. If there is absolutely no relation, return "null".
    
    Output Format (JSON only):
    {
      "match": "Techno",
      "reasoning": "Raving is a subculture closely associated with Techno music events."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const result = JSON.parse(response.text.trim());
    
    if (!result.match || result.match === "null") return null;

    return {
      matchedLabel: result.match,
      reasoning: result.reasoning
    };

  } catch (error) {
    console.error("Gemini Mapping Error:", error);
    // Fallback: Simple string inclusion check
    const simpleMatch = availableTags.find(t => 
      customInput.toLowerCase().includes(t.label.toLowerCase()) || 
      t.label.toLowerCase().includes(customInput.toLowerCase())
    );
    return simpleMatch ? { matchedLabel: simpleMatch.label, reasoning: "Direct text match." } : null;
  }
};

/**
 * Generates a "Social Forecast" for a specific hotel based on the mix of people staying there.
 */
export const generateSocialForecast = async (hotel: ScoredHotel, userInterest: string): Promise<string> => {
  if (!ai) return "Join the crew! Connect with fellow travelers in the lobby.";

  const interestSummary = hotel.topInterests.map(i => `${i.count} people here for ${i.label}`).join(', ');

  const prompt = `
    You are the "Vibe Curator" for a hotel app called VibeLobby.
    A user interested in "${userInterest}" is looking at "${hotel.name}" in ${hotel.city}.
    
    Current guest mix data: ${interestSummary}.
    
    Write a short, punchy, 2-sentence "Social Forecast". 
    Focus on the social collision potential. Do not mention prices. 
    Make it sound exciting like a party promoter or a community manager.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Looks like a great spot for ${userInterest}. ${hotel.matchingGuestCount} others are already booked!`;
  }
};

/**
 * Generates a conversational icebreaker for the Lobby Chat
 */
export const generateLobbyIcebreaker = async (interest: string, city: string): Promise<string> => {
  if (!ai) return `Welcome to the ${interest} tribe in ${city}! Who's around for a meetup?`;

  const prompt = `
    Generate a fun, single-sentence chat message to start a conversation in a group chat for people interested in "${interest}" currently staying in "${city}".
    It should be a question or a call to action.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
     return `Anyone doing ${interest} stuff today in ${city}?`;
  }
};