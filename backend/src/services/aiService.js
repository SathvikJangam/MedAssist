import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateClinicalSummaries = async (diagnosis, observations) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    You are an expert medical AI assistant for MedAssist EMR.
    Given the following diagnosis and raw clinical observations from a doctor, generate two things:
    1. A professional clinical summary (SOAP format preferred) for other medical staff.
    2. A simple, plain-language summary for the patient that explains their condition and care plan without confusing medical jargon.

    Diagnosis: ${diagnosis}
    Raw Observations: ${observations}

    Return ONLY a valid JSON object in this exact format, with no markdown formatting or extra text:
    {
      "clinicalSummary": "...",
      "patientFriendlySummary": "..."
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up Markdown JSON formatting if the AI includes it
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
    
  } catch (error) {
    console.error("Gemini AI Generation Error:", error);
    // Graceful fallback if AI fails (never lose clinical data!)
    return {
      clinicalSummary: observations, // Fallback to raw notes
      patientFriendlySummary: "Summary currently unavailable. Please consult your prescription."
    };
  }
};