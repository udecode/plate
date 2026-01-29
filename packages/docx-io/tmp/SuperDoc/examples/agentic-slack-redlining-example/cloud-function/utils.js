import { TextSelection, Selection } from 'prosemirror-state';
import { Storage } from '@google-cloud/storage';
import { JSDOM } from 'jsdom';
import https from 'https';
import { Editor, getStarterExtensions } from '@harbour-enterprises/superdoc/super-editor';
import dotenv from 'dotenv';
dotenv.config();

// Constants
const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const BUCKET_NAME = process.env.BUCKET_NAME || 'your-bucket-name';
const AI_API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://your-ai-endpoint.com/api/v1/stream';
const URL_EXPIRATION_HOURS = 1;

// =============================================================================
// AI SERVICE UTILITIES
// =============================================================================

/**
 * Reads and processes a streamed response from the AI service
 * @param {Response} response - The streaming response object
 * @returns {Promise<string>} The complete response text
 */
export const getDataFromStreamedResult = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const textChunk = decoder.decode(value, { stream: true });
      result += textChunk;
    }
    return result;
  } catch (error) {
    console.error('Error reading AI response stream:', error);
    throw new Error('Failed to process AI response stream');
  } finally {
    reader.releaseLock();
  }
};

/**
 * Extracts JSON data from AI response text
 * @param {string} aiResult - The raw AI response text
 * @returns {Object} Parsed JSON object
 */
const getJSONFromResult = (aiResult) => {
  try {
    // Extract JSON from code block format
    const codeBlockMatch = aiResult.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }
    
    // Fallback: try to find JSON object in response
    const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    throw new Error('Invalid JSON format in AI response');
  }
};

/**
 * Sends a prompt to the AI service and returns the streaming response
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<Response>} The streaming response
 */
export const getAIResponse = async (prompt) => {
  if (!prompt?.trim()) {
    throw new Error('Prompt is required and cannot be empty');
  }

  const payload = {
    stream: true,
    context: `You are an expert copywriter working with a document editor. 
              Provide precise, document-related text responses based on user prompts. 
              Only write what is requested without explanations. 
              Keep placeholders concise and do not echo the prompt.`,
    insights: [
      {
        type: 'custom_prompt',
        name: 'text_generation',
        message: prompt,
        format: [{ value: '' }],
      },
    ],
  };

  try {
    const response = await fetch(AI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Failed to get AI response:', error);
    throw new Error('AI service is currently unavailable');
  }
};

/**
 * Processes AI response and extracts clause positioning data
 * @param {Object} params - Parameters object
 * @param {Response} params.AIResponse - The AI response stream
 * @param {Editor} params.editor - The document editor instance
 * @returns {Promise<Object>} Object containing position and clause data
 */
export const getDataFromAIResponse = async ({ AIResponse, editor }) => {
  try {
    const result = await getDataFromStreamedResult(AIResponse);
    const json = getJSONFromResult(result);
    
    const { clauseBefore, clauseAfter } = json;
    
    if (!clauseBefore) {
      throw new Error('AI response missing required clauseBefore field');
    }

    const position = getClausePosition(editor, clauseBefore);

    return {
      position,
      clauseBefore,
      clauseAfter,
    };
  } catch (error) {
    console.error('Failed to process AI response data:', error);
    throw new Error('Unable to extract clause positioning from AI response');
  }
};

// =============================================================================
// CLOUD STORAGE UTILITIES
// =============================================================================

/**
 * Generates a signed URL for Google Cloud Storage operations
 * @param {string} bucketName - The storage bucket name
 * @param {string} objectName - The object/file name
 * @param {Date} expirationTime - When the URL expires
 * @param {string} action - The action type ('read' or 'write')
 * @returns {Promise<string>} The signed URL
 */
const generateSignedUrl = async (bucketName, objectName, expirationTime, action) => {
  try {
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);

    const options = {
      version: 'v4',
      action,
      expires: expirationTime,
      ...(action === 'write' && { contentType: DOCX_MIME_TYPE }),
    };

    const [signedUrl] = await file.getSignedUrl(options);
    return signedUrl;
  } catch (error) {
    console.error(`Failed to generate ${action} signed URL:`, error);
    throw new Error(`Unable to generate signed URL for ${action} operation`);
  }
};

/**
 * Uploads data to a signed URL
 * @param {string} uploadUrl - The signed upload URL
 * @param {Buffer} data - The data to upload
 * @returns {Promise<void>}
 */
export const uploadToSignedUrl = async (uploadUrl, data) => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(uploadUrl);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'PUT',
        headers: {
          'Content-Type': DOCX_MIME_TYPE,
          'Content-Length': data.length,
        },
      };

      const request = https.request(options, (response) => {
        let responseData = '';
        
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            console.log('File uploaded successfully');
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${response.statusCode}`));
          }
        });
      });

      request.on('error', (error) => {
        console.error('Upload request error:', error);
        reject(new Error('Network error during file upload'));
      });

      request.write(data);
      request.end();
    } catch (error) {
      reject(new Error(`Invalid upload URL: ${error.message}`));
    }
  });
};

/**
 * Generates both upload and download signed URLs for a file
 * @param {string} objectName - The name of the file/object
 * @returns {Promise<Object>} Object containing upload and download URLs
 */
export const generateUploadDownloadUrls = async (objectName) => {
  if (!objectName?.trim()) {
    throw new Error('Object name is required');
  }

  const expirationTime = new Date(Date.now() + URL_EXPIRATION_HOURS * 60 * 60 * 1000);

  try {
    const [uploadUrl, downloadUrl] = await Promise.all([
      generateSignedUrl(BUCKET_NAME, objectName, expirationTime, 'write'),
      generateSignedUrl(BUCKET_NAME, objectName, expirationTime, 'read'),
    ]);

    return {
      upload: uploadUrl,
      download: downloadUrl,
    };
  } catch (error) {
    console.error('Failed to generate signed URLs:', error);
    throw new Error('Unable to generate file access URLs');
  }
};

// =============================================================================
// DOCUMENT EDITOR UTILITIES
// =============================================================================

/**
 * Finds the position of a phrase in the document for clause insertion
 * @param {Editor} editor - The document editor instance
 * @param {string} phrase - The phrase to search for
 * @returns {number|null} The position after the phrase, or null if not found
 */
const getClausePosition = (editor, phrase) => {
  if (!phrase?.trim()) {
    console.warn('Empty phrase provided for position search');
    return null;
  }

  try {
    const searchResults = editor.commands.search(phrase);
    if (!searchResults || searchResults.length === 0) {
      console.log(`Phrase not found in document: "${phrase}"`);
      return null;
    }

    // Use the last occurrence if multiple matches
    const { to } = searchResults[searchResults.length - 1];
    return to;
  } catch (error) {
    console.error('Error searching for clause position:', error);
    return null;
  }
};

/**
 * Positions the cursor at a specific location in the document
 * @param {Editor} editor - The document editor instance
 * @param {number|null} toPos - The position to move cursor to (null for end)
 */
const positionCursor = (editor, toPos) => {
  try {
    let selection;
    
    if (toPos === null || toPos === undefined) {
      selection = Selection.atEnd(editor.view.state.doc);
    } else {
      const resolvedPos = editor.view.state.doc.resolve(Math.min(toPos + 1, editor.view.state.doc.content.size));
      selection = new TextSelection(resolvedPos);
    }

    const transaction = editor.view.state.tr.setSelection(selection);
    const newState = editor.view.state.apply(transaction);
    editor.view.updateState(newState);
  } catch (error) {
    console.error('Failed to position cursor:', error);
    // Don't throw - cursor positioning is not critical
  }
};

/**
 * Initializes a document editor with DOCX content
 * @param {Buffer} docxFileBuffer - The DOCX file buffer
 * @returns {Promise<Editor>} Initialized editor instance
 */
export const getEditor = async (docxFileBuffer) => {
  if (!docxFileBuffer || !Buffer.isBuffer(docxFileBuffer)) {
    throw new Error('Valid DOCX file buffer is required');
  }

  try {
    // Create mock DOM environment for headless operation
    const { window: mockWindow } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const { document: mockDocument } = mockWindow;

    // Load document content and media files
    const [content, mediaFiles] = await Editor.loadXmlData(docxFileBuffer);

    // Create editor instance
    const editor = new Editor({
      user: {
        name: 'SuperDoc',
        email: null,
        image: null,
      },
      isHeadless: true,
      mockDocument,
      mockWindow,
      extensions: getStarterExtensions(),
      content,
      mediaFiles,
    });

    return editor;
  } catch (error) {
    console.error('Failed to initialize editor:', error);
    throw new Error('Unable to load document in editor');
  }
};

/**
 * Inserts a clause suggestion at the specified position in the document
 * @param {Object} params - Parameters object
 * @param {Editor} params.editor - The document editor instance
 * @param {number} params.position - The position to insert the clause
 * @param {string} params.clause - The clause text to insert
 */
export const insertSuggestion = ({ editor, position, clause }) => {
  if (!editor) {
    throw new Error('Editor instance is required');
  }
  
  if (!clause?.trim()) {
    throw new Error('Clause text is required');
  }

  try {
    // Enable suggestion mode
    editor.setDocumentMode('suggesting');
    editor.commands.enableTrackChanges();
    
    // Position cursor and insert clause
    positionCursor(editor, position);
    editor.commands.insertContent(`<br /><br />${clause.trim()}<br /><br />`);
    
    console.log('Clause suggestion inserted successfully');
  } catch (error) {
    console.error('Failed to insert clause suggestion:', error);
    throw new Error('Unable to insert clause in document');
  }
};

export { DOCX_MIME_TYPE };