const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API key - check happens lazily in functions
let genAI = null;

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to backend/.env file and restart the server.');
  }
  
  // Initialize only once
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log(`✅ Gemini API Key loaded: ${apiKey.substring(0, 10)}...`);
  }
  
  return genAI;
}

/**
 * Prepare file data for Gemini multimodal API
 * For PDFs and images, we pass them directly as inline data
 */
function prepareFileDataForGemini(fileBuffer, mimeType) {
  // Convert buffer to base64 for inline data
  const base64Data = fileBuffer.toString('base64');
  
  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  };
}

async function generateSummary(text, fileBuffer = null, fileType = null, fileName = null, useFileUpload = false, isDirectPrompt = false) {
  const genAIInstance = getGenAI();
  
  let prompt;
  let filePart = null;
  
  // If this is a direct text prompt (not a document), answer it directly
  if (isDirectPrompt) {
    const textToProcess = text.trim();
    
    prompt = `You are an expert AI assistant. The user has asked you a question or provided a prompt. Please provide a comprehensive, well-structured answer.

CRITICAL INSTRUCTIONS:
1. DIRECT ANSWER: Answer the user's question or respond to their prompt directly. Do NOT summarize their text - treat it as a question/prompt that needs an answer.
2. STRUCTURE: Organize your response with clear headings and formatting:
   - Use # for main title
   - Use ## for major sections
   - Use ### for subsections
   - Use - or * for bullet points
   - Use **text** for important terms (will be displayed as bold)
   - Use *text* for emphasis (will be displayed as italic)
   - For mathematical formulas, use LaTeX syntax:
     * Inline math: $formula$ (e.g., $E = mc^2$)
     * Block math: $$formula$$ (e.g., $$\int_{a}^{b} f(x)dx$$)

3. CONTENT QUALITY:
   - Provide accurate, detailed, and helpful information
   - Include examples and explanations where relevant
   - Be comprehensive but concise
   - Use proper formatting to make the answer easy to read

4. FORMATTING: Use proper markdown formatting with headings, lists, and emphasis

User's Question/Prompt:
${textToProcess.substring(0, 15000)}

Now, provide a comprehensive answer to the user's question or prompt.`;
    
    console.log('💬 Direct prompt detected - generating direct answer (not summary)');
  } else if (useFileUpload) {
    if (!fileBuffer || !fileType) {
      throw new Error('File upload is required but file buffer or file type is missing. Please re-upload the document.');
    }
    
    // Use direct file data for scanned PDFs/images (inline base64)
    console.log('📤 Preparing file for Gemini multimodal processing (scanned PDF detected)...');
    console.log('File info:', { type: fileType, size: fileBuffer.length, name: fileName });
    
    try {
      // Prepare file data as inline base64 (supported by Gemini multimodal API)
      filePart = prepareFileDataForGemini(fileBuffer, fileType);
      
      prompt = `You are an expert educational assistant specializing in creating comprehensive, well-structured summaries. Your task is to analyze this document and create a detailed summary that helps students understand the material.

CRITICAL INSTRUCTIONS:
1. CONTENT ANALYSIS: Carefully read and analyze ALL text, images, diagrams, and visual content in the document
2. IGNORE ARTIFACTS: Completely ignore watermarks, app names , filenames, page numbers, or any metadata - focus ONLY on educational content
3. STRUCTURE: Organize your summary with clear headings and formatting:
   - Use # for main title
   - Use ## for major sections
   - Use ### for subsections
   - Use - or * for bullet points
   - Use **text** for important terms (will be displayed as bold)
   - Use *text* for emphasis (will be displayed as italic)
   - For mathematical formulas, use LaTeX syntax:
     * Inline math: $formula$ (e.g., $E = mc^2$)
     * Block math: $$formula$$ (e.g., $$\int_{a}^{b} f(x)dx$$)
   - Use standard mathematical notation with LaTeX

4. CONTENT QUALITY:
   - Identify and explain the main topics and key concepts
   - Include important details, examples, and supporting information
   - Highlight relationships between concepts
   - Note any important definitions, formulas, or technical terms
   - Maintain accuracy - only summarize what is actually in the document

5. FORMATTING: Use proper markdown formatting with headings, lists, and emphasis to make the summary easy to read and navigate

6. LENGTH: Provide a comprehensive summary that covers all major points while remaining concise and readable

Now, analyze the document and create a well-formatted, comprehensive summary following these guidelines.`;
      
      console.log('✅ Using Gemini multimodal API with inline file data');
      console.log('✅ File prepared successfully. Processing with Gemini vision...');
    } catch (prepError) {
      console.error('❌ Failed to prepare file for Gemini:', prepError);
      throw new Error(`Failed to prepare file for Gemini processing: ${prepError.message}. The document might be too large or unsupported.`);
    }
  } else {
    // Use text extraction (original method) - only for text-based PDFs
    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided to generate summary');
    }
    
    // Ensure we have actual text content (not just filename or empty)
    const textToProcess = text.trim();
    if (textToProcess.length < 20) {
      throw new Error('Extracted text is too short. The file might be image-based (scanned PDF) or text extraction failed.');
    }
    
    prompt = `You are an expert educational assistant specializing in creating comprehensive, well-structured summaries. Your task is to analyze the following academic content and create a detailed summary that helps students understand the material.

CRITICAL INSTRUCTIONS:
1. CONTENT ANALYSIS: Carefully analyze ALL text and information provided below
2. STRUCTURE: Organize your summary with clear headings and formatting:
   - Use # for main title
   - Use ## for major sections
   - Use ### for subsections
   - Use - or * for bullet points
   - Use **text** for important terms (will be displayed as bold)
   - Use *text* for emphasis (will be displayed as italic)
   - For mathematical formulas, use LaTeX syntax:
     * Inline math: $formula$ (e.g., $E = mc^2$)
     * Block math: $$formula$$ (e.g., $$\int_{a}^{b} f(x)dx$$)
   - Use standard mathematical notation with LaTeX

3. CONTENT QUALITY:
   - Identify and explain the main topics and key concepts
   - Include important details, examples, and supporting information
   - Highlight relationships between concepts
   - Note any important definitions, formulas, or technical terms
   - Maintain accuracy - only summarize what is actually in the content

4. FORMATTING: Use proper markdown formatting with headings, lists, and emphasis to make the summary easy to read and navigate

5. LENGTH: Provide a comprehensive summary that covers all major points while remaining concise and readable

Document Content:
${textToProcess.substring(0, 15000)}

Now, analyze the content above and create a well-formatted, comprehensive summary following these guidelines.`;
  }
  
  // Try available models in order (as of 2025)
  // Free tier: gemini-2.5-flash (250 req/day)
  // Note: gemini-1.5-pro was retired Sept 24, 2025, gemini-pro is deprecated
  const models = ['gemini-2.5-flash'];
  
  console.log('🔄 Attempting to generate summary, trying models:', models.join(', '));
  
  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      console.log(`📝 Trying model: ${modelName}...`);
      const model = genAIInstance.getGenerativeModel({ model: modelName });
      
        // Use multimodal API if file is uploaded, otherwise use text
      let result;
      if (filePart) {
        // For multimodal: pass prompt and file part as array
        console.log('📤 Sending to Gemini:', { 
          hasPrompt: !!prompt, 
          hasFilePart: !!filePart,
          fileMimeType: filePart.inlineData?.mimeType 
        });
        result = await model.generateContent([prompt, filePart]);
      } else {
        result = await model.generateContent(prompt);
      }
      
      const response = await result.response;
      console.log(`✅ Successfully generated summary using model: ${modelName}`);
      return response.text();
    } catch (error) {
      const errorMsg = error.message || '';
      const isNotFound = errorMsg.includes('404') || 
                        errorMsg.includes('not found') || 
                        errorMsg.includes('Not Found') ||
                        errorMsg.includes('not available') ||
                        errorMsg.includes('is not available') ||
                        error.code === 404;
      
      // If model not found and we have another model to try, continue
      if (isNotFound && i < models.length - 1) {
        console.log(`❌ Model ${modelName} not available (${errorMsg.substring(0, 100)}), trying ${models[i + 1]}...`);
        continue;
      }
      
      // For other errors or if we've tried all models, throw the error
      console.error(`Error generating summary with ${modelName}:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        code: error.code
      });
      
      // Provide helpful error messages
      if (errorMsg.includes('403') || error.code === 403) {
        throw new Error('API key is invalid or restricted. Please check: 1) API key is correct, 2) Gemini API is enabled in Google Cloud Console, 3) API key has proper permissions.');
      } else if (errorMsg.includes('401') || error.code === 401) {
        throw new Error('API key is invalid. Please verify your Gemini API key.');
      } else if (errorMsg.includes('429') || error.code === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else if (errorMsg.includes('503') || error.code === 503 || errorMsg.includes('overloaded') || errorMsg.includes('Service Unavailable')) {
        throw new Error('The Gemini API is temporarily overloaded. Please wait a few moments and try again. This is a temporary issue on Google\'s side.');
      } else if (isNotFound) {
        // If this is the last model, provide a comprehensive error message
        if (i === models.length - 1) {
          throw new Error(`None of the available models (${models.join(', ')}) are accessible with your API key. Please verify: 1) Your Gemini API key is correct, 2) The API key has access to Gemini models, 3) Check Google AI Studio (https://aistudio.google.com/) to see which models are available for your account.`);
        }
        throw new Error(`Model ${modelName} is not available. Trying next model...`);
      }
      
      throw new Error(error.message || 'Failed to generate summary. Please check your API key and try again.');
    }
  }
  
  throw new Error(`Failed to generate summary. Tried all models (${models.join(', ')}) but none are available. Please check your Gemini API key and ensure it has access to at least one Gemini model. Visit https://aistudio.google.com/ to verify your API key and available models.`);
}

async function generateFlashcards(text, fileBuffer = null, fileType = null, fileName = null, useFileUpload = false) {
  const genAIInstance = getGenAI();
  
  let prompt;
  let filePart = null;
  
  // If file upload is required (scanned PDF), use it
  if (useFileUpload && fileBuffer && fileType) {
    console.log('📤 Preparing file for flashcards generation (scanned PDF)...');
    filePart = prepareFileDataForGemini(fileBuffer, fileType);
    
    prompt = `You are an expert educational assistant specializing in creating high-quality study flashcards. Analyze this document and create 10-15 flashcards that help students learn and retain the material.

CRITICAL INSTRUCTIONS:
1. CONTENT ANALYSIS: Carefully read and analyze ALL text, images, diagrams, and visual content in the document
2. IGNORE ARTIFACTS: Completely ignore watermarks, app names , filenames, page numbers, or any metadata - focus ONLY on educational content
3. FLASHCARD QUALITY:
   - Create flashcards covering the most important concepts, definitions, facts, and relationships
   - Ensure questions are clear, specific, and test understanding (not just recall)
   - Answers should be accurate, concise, and informative
   - Cover a variety of topics from the document to ensure comprehensive coverage
   - Include both factual questions (definitions, dates, facts) and conceptual questions (explain, compare, analyze)

4. FORMAT: Return ONLY a valid JSON array. Each object must have exactly two fields:
   - "question": A clear, well-formulated question (string)
   - "answer": A concise, accurate answer (string)

5. JSON STRUCTURE: 
   [
     {"question": "Question text here", "answer": "Answer text here"},
     {"question": "Another question", "answer": "Another answer"}
   ]

6. ACCURACY: Ensure all information is accurate and directly based on the document content

Now, analyze the document and create 10-15 high-quality flashcards. Return ONLY the JSON array, no additional text, explanations, or markdown formatting.`;
    
    console.log('✅ Using Gemini multimodal API for flashcards');
  } else {
    // Use text extraction (original method)
    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided to generate flashcards');
    }
    
    const textToProcess = text.trim();
    if (textToProcess.length < 20) {
      throw new Error('Extracted text is too short. The file might be image-based (scanned PDF) or text extraction failed.');
    }
    
    prompt = `You are an expert educational assistant specializing in creating high-quality study flashcards. Analyze the following academic content and create 10-15 flashcards that help students learn and retain the material.

CRITICAL INSTRUCTIONS:
1. CONTENT ANALYSIS: Carefully analyze ALL text and information provided below
2. FLASHCARD QUALITY:
   - Create flashcards covering the most important concepts, definitions, facts, and relationships
   - Ensure questions are clear, specific, and test understanding (not just recall)
   - Answers should be accurate, concise, and informative
   - Cover a variety of topics from the content to ensure comprehensive coverage
   - Include both factual questions (definitions, dates, facts) and conceptual questions (explain, compare, analyze)

3. FORMAT: Return ONLY a valid JSON array. Each object must have exactly two fields:
   - "question": A clear, well-formulated question (string)
   - "answer": A concise, accurate answer (string)

4. JSON STRUCTURE: 
   [
     {"question": "Question text here", "answer": "Answer text here"},
     {"question": "Another question", "answer": "Another answer"}
   ]

5. ACCURACY: Ensure all information is accurate and directly based on the content provided

Content:
${textToProcess.substring(0, 15000)}

Now, analyze the content above and create 10-15 high-quality flashcards. Return ONLY the JSON array, no additional text, explanations, or markdown formatting.`;
  }
  
  // Use current free tier models (as of 2025)
  // gemini-2.5-flash: 250 req/day
  const models = ['gemini-2.5-flash'];
  
  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      console.log(`📝 Trying model ${modelName} for flashcards...`);
      const model = genAIInstance.getGenerativeModel({ model: modelName });
      
      let result;
      if (filePart) {
        result = await model.generateContent([prompt, filePart]);
      } else {
        result = await model.generateContent(prompt);
      }
      
      const response = await result.response;
      const responseText = response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return JSON.parse(responseText);
    } catch (error) {
      const errorMsg = error.message || '';
      const isNotFound = errorMsg.includes('404') || 
                        errorMsg.includes('not found') || 
                        errorMsg.includes('Not Found') ||
                        errorMsg.includes('not available') ||
                        errorMsg.includes('is not available') ||
                        error.code === 404;
      
      if (isNotFound && i < models.length - 1) {
        console.log(`Model ${modelName} not available, trying ${models[i + 1]}...`);
        continue;
      }
      
      console.error(`Error generating flashcards with ${modelName}:`, error);
      if (errorMsg.includes('403') || error.code === 403) {
        throw new Error('API key is invalid or restricted. Please check your Gemini API key and permissions.');
      } else if (errorMsg.includes('503') || error.code === 503 || errorMsg.includes('overloaded') || errorMsg.includes('Service Unavailable')) {
        throw new Error('The Gemini API is temporarily overloaded. Please wait a few moments and try again. This is a temporary issue on Google\'s side.');
      }
      throw error;
    }
  }
  
  throw new Error('Failed to generate flashcards. No available models found.');
}

async function generateQuiz(text, fileBuffer = null, fileType = null, fileName = null, useFileUpload = false) {
  const genAIInstance = getGenAI();
  
  let prompt;
  let filePart = null;
  
  // If file upload is required (scanned PDF), use it
  if (useFileUpload && fileBuffer && fileType) {
    console.log('📤 Preparing file for quiz generation (scanned PDF)...');
    filePart = prepareFileDataForGemini(fileBuffer, fileType);
    
    prompt = `You are an expert educational assistant specializing in creating high-quality multiple-choice quiz questions. Analyze this document and create 10 quiz questions that effectively test student understanding of the material.

CRITICAL INSTRUCTIONS:
1. CONTENT ANALYSIS: Carefully read and analyze ALL text, images, diagrams, and visual content in the document
2. IGNORE ARTIFACTS: Completely ignore watermarks, app names , filenames, page numbers, or any metadata - focus ONLY on educational content
3. QUESTION QUALITY:
   - Create questions that test understanding, not just memorization
   - Cover the most important concepts, facts, and relationships from the document
   - Ensure questions are clear, unambiguous, and well-written
   - Include a mix of difficulty levels (some easier recall questions, some more analytical)
   - Cover diverse topics to provide comprehensive assessment

4. ANSWER OPTIONS:
   - Provide exactly 4 options (A, B, C, D) for each question
   - Make incorrect options plausible but clearly wrong (avoid obviously ridiculous distractors)
   - Ensure only one option is definitively correct
   - Vary the position of the correct answer across questions

5. EXPLANATIONS:
   - Provide clear, concise explanations for why the correct answer is right
   - Optionally mention why key incorrect options are wrong (if helpful)

6. FORMAT: Return ONLY a valid JSON array. Each object must have exactly these fields:
   - "question": The question text (string)
   - "options": Array of exactly 4 answer options (array of strings)
   - "correctAnswer": Index of correct option, 0-3 (number)
   - "explanation": Brief explanation of the correct answer (string)

7. JSON STRUCTURE:
   [
     {
       "question": "Question text here?",
       "options": ["Option A", "Option B", "Option C", "Option D"],
       "correctAnswer": 0,
       "explanation": "Explanation here"
     }
   ]

8. ACCURACY: Ensure all questions and answers are accurate and directly based on the document content

Now, analyze the document and create 10 high-quality multiple-choice questions. Return ONLY the JSON array, no additional text, explanations, or markdown formatting.`;
    
    console.log('✅ Using Gemini multimodal API for quiz');
  } else {
    // Use text extraction (original method)
    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided to generate quiz');
    }
    
    const textToProcess = text.trim();
    if (textToProcess.length < 20) {
      throw new Error('Extracted text is too short. The file might be image-based (scanned PDF) or text extraction failed.');
    }
    
    prompt = `You are an expert educational assistant specializing in creating high-quality multiple-choice quiz questions. Analyze the following academic content and create 10 quiz questions that effectively test student understanding of the material.

CRITICAL INSTRUCTIONS:
1. CONTENT ANALYSIS: Carefully analyze ALL text and information provided below
2. QUESTION QUALITY:
   - Create questions that test understanding, not just memorization
   - Cover the most important concepts, facts, and relationships from the content
   - Ensure questions are clear, unambiguous, and well-written
   - Include a mix of difficulty levels (some easier recall questions, some more analytical)
   - Cover diverse topics to provide comprehensive assessment

3. ANSWER OPTIONS:
   - Provide exactly 4 options (A, B, C, D) for each question
   - Make incorrect options plausible but clearly wrong (avoid obviously ridiculous distractors)
   - Ensure only one option is definitively correct
   - Vary the position of the correct answer across questions

4. EXPLANATIONS:
   - Provide clear, concise explanations for why the correct answer is right
   - Optionally mention why key incorrect options are wrong (if helpful)

5. FORMAT: Return ONLY a valid JSON array. Each object must have exactly these fields:
   - "question": The question text (string)
   - "options": Array of exactly 4 answer options (array of strings)
   - "correctAnswer": Index of correct option, 0-3 (number)
   - "explanation": Brief explanation of the correct answer (string)

6. JSON STRUCTURE:
   [
     {
       "question": "Question text here?",
       "options": ["Option A", "Option B", "Option C", "Option D"],
       "correctAnswer": 0,
       "explanation": "Explanation here"
     }
   ]

7. ACCURACY: Ensure all questions and answers are accurate and directly based on the content provided

Content:
${textToProcess.substring(0, 15000)}

Now, analyze the content above and create 10 high-quality multiple-choice questions. Return ONLY the JSON array, no additional text, explanations, or markdown formatting.`;
  }
  
  // Use current free tier models (as of 2025)
  // gemini-2.5-flash: 250 req/day
  const models = ['gemini-2.5-flash'];
  
  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      console.log(`📝 Trying model ${modelName} for quiz...`);
      const model = genAIInstance.getGenerativeModel({ model: modelName });
      
      let result;
      if (filePart) {
        result = await model.generateContent([prompt, filePart]);
      } else {
        result = await model.generateContent(prompt);
      }
      
      const response = await result.response;
      const responseText = response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      const errorMsg = error.message || '';
      const isNotFound = errorMsg.includes('404') || 
                        errorMsg.includes('not found') || 
                        errorMsg.includes('Not Found') ||
                        errorMsg.includes('not available') ||
                        errorMsg.includes('is not available') ||
                        error.code === 404;
      
      if (isNotFound && i < models.length - 1) {
        console.log(`Model ${modelName} not available, trying ${models[i + 1]}...`);
        continue;
      }
      
      console.error(`Error generating quiz with ${modelName}:`, error);
      if (errorMsg.includes('403') || error.code === 403) {
        throw new Error('API key is invalid or restricted. Please check your Gemini API key and permissions.');
      } else if (errorMsg.includes('503') || error.code === 503 || errorMsg.includes('overloaded') || errorMsg.includes('Service Unavailable')) {
        throw new Error('The Gemini API is temporarily overloaded. Please wait a few moments and try again. This is a temporary issue on Google\'s side.');
      }
      throw error;
    }
  }
  
  throw new Error('Failed to generate quiz. No available models found.');
}

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz
};


