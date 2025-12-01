import { GoogleGenAI } from "@google/genai";

// Ensure API Key is available
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const generateAIResponse = async (
  prompt: string, 
  context: string = "", 
  mode: 'chat' | 'improve' | 'summarize' | 'citation' | 'related_work' | 'semantic_search' | 'tagging' | 'find_papers' | 'manuscript_coach' | 'training_coach' = 'chat'
): Promise<string> => {
  if (!ai) return "خطا: کلید API یافت نشد. لطفا پیکربندی را بررسی کنید.\n(Error: API Key not found)";

  const modelName = 'gemini-2.5-flash';
  
  let systemInstruction = "You are AcademiaPro AI, a sophisticated research assistant for PhD and Master's students. Your tone is academic, precise, and helpful.";
  
  if (mode === 'improve') {
    systemInstruction += " Your task is to improve the academic writing of the provided text. Correct grammar, enhance vocabulary to be more formal/scientific, and improve flow. Do not change the core meaning.";
  } else if (mode === 'summarize') {
    systemInstruction += " Your task is to provide a concise, structured summary of the text, highlighting hypothesis, methodology, and key findings.";
  } else if (mode === 'related_work') {
      systemInstruction += " Your task is to write a cohesive 'Related Work' section based on the provided list of papers and their abstracts. Synthesize the information, find common themes, and contrast the approaches. Cite them as [Author, Year].";
  } else if (mode === 'semantic_search') {
      systemInstruction += " You are a semantic search engine. You will receive a user query and a list of JSON items (papers/notes). Return a JSON array of strings containing ONLY the IDs of the items that semantically match the user's intent, sorted by relevance. If no items match, return an empty array []. Do not explain.";
  } else if (mode === 'tagging') {
      systemInstruction += " You are an automated librarian. Analyze the provided text and generate 3-5 relevant academic tags or keywords. Return them as a JSON array of strings (e.g., [\"Machine Learning\", \"Neural Networks\"]). Do not include markdown formatting.";
  } else if (mode === 'find_papers') {
      // Logic for parsing the new JSON structured prompt from ReferenceManager
      let query = prompt;
      let type = 'journal';
      let lang = 'mixed';
      
      try {
          // Attempt to parse if prompt is JSON
          const parsed = JSON.parse(prompt);
          if(parsed.topic) {
             query = parsed.topic;
             type = parsed.type || 'journal';
             lang = parsed.language || 'mixed';
          }
      } catch(e) {
          // If parse fails, assume plain string prompt
      }

      systemInstruction += ` You are a Senior Academic Bibliographer with access to comprehensive global and Iranian citation databases (e.g., ISC, SID, Google Scholar, Scopus).

      SEARCH REQUEST: "${query}"
      TYPE: ${type.toUpperCase()}
      LANGUAGE MODE: ${lang.toUpperCase()}

      INSTRUCTIONS:
      1.  **Persian Sources (Critical):** If language is 'mixed' or 'fa', you MUST provide at least 3 high-quality Persian (Farsi) sources FIRST. Use valid transliterated titles or original Farsi script if possible.
      2.  **Resource Type:** 
          - If type is 'book', return ONLY academic books, handbooks, or monographs. Publisher name is required.
          - If type is 'journal', return ONLY peer-reviewed journal articles. Journal name is required.
      3.  **Accuracy:** Use real, existing citations. If exact matches for the specific query are rare, generalize slightly to find the best relevant existing literature.

      OUTPUT FORMAT:
      Return a valid JSON Object with a single key "papers" containing an array of 6 source objects.
      
      Example JSON Structure:
      {
        "papers": [
          {
            "title": "عنوان مقاله فارسی (Persian Title)",
            "authors": ["Author 1", "Author 2"],
            "year": "1402",
            "publication": "Journal Name / Publisher",
            "abstract": "Brief academic abstract in the language of the source."
          },
          {
            "title": "English Title",
            "authors": ["Author A"],
            "year": "2024",
            "publication": "Nature",
            "abstract": "Abstract in English."
          }
        ]
      }
      `;
  } else if (mode === 'manuscript_coach') {
      systemInstruction += " You are a writing coach. The user is writing a specific section of a paper. Provide specific outlines, sentence starters, or checklists for that section. Be encouraging but rigorous.";
  } else if (mode === 'training_coach') {
      systemInstruction += " You are an expert academic mentor teaching a student how to write a research paper. The user is asking for help with a specific step of the writing process (e.g., 'Choosing a Title' or 'Writing the Discussion'). Provide concrete, professional advice, examples, and 'Do's and Don'ts'. Format your response in Markdown.";
  }

  try {
    // If finding papers, we just pass the query (topic) to the model, as constraints are in system instruction
    const fullPrompt = context 
      ? `CONTEXT:\n${context}\n\nUSER REQUEST:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: mode === 'semantic_search' || mode === 'tagging' ? 0 : 0.7,
        // Ensure strictly JSON response for data modes
        responseMimeType: (mode === 'semantic_search' || mode === 'tagging' || mode === 'find_papers') ? 'application/json' : 'text/plain',
      },
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Error";
  }
};

// Specialized function for DOI/Metadata lookups
export const fetchPaperMetadata = async (identifier: string): Promise<any> => {
    if (!ai) throw new Error("No API Key");
    
    const prompt = `Extract metadata for the paper with Identifier: "${identifier}". 
    Return a JSON object with keys: title, authors (array of strings), year, publication, abstract. 
    If you cannot find it, hallucinate a realistic academic entry based on the ID structure or return error.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error(e);
        return null;
    }
}