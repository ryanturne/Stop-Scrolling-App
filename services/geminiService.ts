import { GoogleGenAI, Type } from "@google/genai";
import { PostData } from '../types';
import { FALLBACK_POSTS } from '../constants';

export const generatePosts = async (count: number = 5): Promise<PostData[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key found, using fallback data.");
    // Return a randomized subset of fallback posts to simulate variety
    return [...FALLBACK_POSTS].sort(() => 0.5 - Math.random()).slice(0, count);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} engaging, viral-style social media posts similar to TikTok or Instagram Reels. 
      Include a username, a catchy caption with hashtags, a realistic like count (between 1000 and 1000000), 
      a comment count, and a fictional music track name.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              username: { type: Type.STRING },
              caption: { type: Type.STRING },
              likes: { type: Type.INTEGER },
              comments: { type: Type.INTEGER },
              musicTrack: { type: Type.STRING },
              imageKeyword: { type: Type.STRING, description: "A single keyword to search for an image, e.g., 'cat', 'sunset', 'car'" }
            },
            required: ["username", "caption", "likes", "comments", "musicTrack", "imageKeyword"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");

    return data.map((item: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      username: item.username,
      caption: item.caption,
      likes: item.likes,
      comments: item.comments,
      musicTrack: item.musicTrack,
      imageUrl: `https://picsum.photos/seed/${item.imageKeyword || 'random'}/800/1200`
    }));

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return FALLBACK_POSTS;
  }
};