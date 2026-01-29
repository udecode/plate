import fs from "fs";
import { readFile, unlink } from "fs/promises";
import express from "express";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  getAIResponse,
  generateUploadDownloadUrls,
  getDataFromAIResponse,
  uploadToSignedUrl,
  insertSuggestion,
  getEditor,
  getDataFromStreamedResult,
} from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "Document processing service is running" });
});

// Main document processing endpoint
app.post("/", async (req, res) => {
  let filePath = null;
  
  try {
    const { clauseType, fileUrl } = req.body;
    
    // Validate required fields
    if (!clauseType || !fileUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: clauseType and fileUrl are required",
      });
    }

    // Validate URL format
    if (!isValidUrl(fileUrl)) {
      return res.status(400).json({
        success: false,
        error: "Invalid fileUrl format",
      });
    }

    // Download file
    filePath = await downloadFile(fileUrl);
    
    // Process document
    const documentData = await readFile(filePath);
    const editor = await initializeEditor(documentData);
    
    // Generate clause content
    const clause = await generateClause(clauseType);
    
    // Find insertion position
    const xml = editor.state.doc.textContent;
    const { clauseBefore, clauseAfter, position } = await findInsertionPosition(xml, clause, editor);
    
    // Insert clause
    insertSuggestion({ editor, position, clause });
    
    // Export and upload document
    const zipBuffer = await exportDocument(editor);
    const uploadedFileName = path.basename(filePath);
    const { upload: uploadUrl, download: downloadUrl } = await generateUploadDownloadUrls(uploadedFileName);
    
    await uploadToSignedUrl(uploadUrl, Buffer.from(zipBuffer));

    // Send success response
    res.status(200).json({
      success: true,
      file: downloadUrl,
      clauseBefore,
      clause,
      clauseAfter,
    });

  } catch (error) {
    console.error("Error processing document:", error);
    
    // Send appropriate error response
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    } else if (error.name === 'NetworkError') {
      res.status(502).json({
        success: false,
        error: "Failed to download or upload file",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "An unexpected error occurred while processing the document",
      });
    }
  } finally {
    // Clean up temporary file
    if (filePath) {
      await cleanupFile(filePath);
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Utility functions
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(fileUrl) {
  const fileName = `${Date.now()}_${path.basename(fileUrl)}.docx`;
  const filePath = path.join(__dirname, "temp", fileName);
  
  // Ensure temp directory exists
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    
    const request = https.get(fileUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status: ${response.statusCode}`));
        return;
      }
      
      response.pipe(fileStream);
      
      fileStream.on("finish", () => {
        fileStream.close();
        resolve(filePath);
      });
    });
    
    request.on("error", (err) => {
      fs.unlink(filePath, () => {}); // Clean up on error
      const networkError = new Error(`Network error: ${err.message}`);
      networkError.name = 'NetworkError';
      reject(networkError);
    });
    
    fileStream.on("error", (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function initializeEditor(documentData) {
  try {
    return await getEditor(documentData);
  } catch (error) {
    const editorError = new Error("Failed to initialize document editor");
    editorError.name = 'ValidationError';
    throw editorError;
  }
}

async function generateClause(clauseType) {
  const clausePrompt = `
    Generate a body of text without placeholders or templating based on the following clause type: ${clauseType}
    Return the generated text in a single string without any other text.
  `;
  
  try {
    const clauseResponse = await getAIResponse(clausePrompt);
    return await getDataFromStreamedResult(clauseResponse);
  } catch (error) {
    throw new Error(`Failed to generate clause for type: ${clauseType}`);
  }
}

async function findInsertionPosition(xml, clause, editor) {
  const prompt = `
    Refer to this text as "clause": ${clause}
    Find the phrase after which the clause should be inserted in this document text: "${xml}"
    
    Return your results in a JSON response like this:
    {
      "clauseBefore": "text that comes before the insertion point",
      "clauseAfter": "text that comes after the insertion point"
    }
  `;

  try {
    const AIResponse = await getAIResponse(prompt);
    return await getDataFromAIResponse({ AIResponse, editor });
  } catch (error) {
    throw new Error("Failed to determine clause insertion position");
  }
}

async function exportDocument(editor) {
  try {
    return await editor.exportDocx();
  } catch (error) {
    console.error("Error exporting document:", error);
    throw new Error("Failed to export document");
  }
}

async function cleanupFile(filePath) {
  try {
    await unlink(filePath);
  } catch (error) {
    console.warn(`Failed to cleanup temporary file: ${filePath}`, error);
  }
}

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Document processing server running on ${HOST}:${PORT}`);
});

export default app;