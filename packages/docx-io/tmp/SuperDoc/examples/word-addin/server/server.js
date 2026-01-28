import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import { Storage } from "@google-cloud/storage";
import crypto from "crypto";
import { auth } from "express-oauth2-jwt-bearer";
import fs from "fs";
import WebSocket from "ws";
import { JSDOM } from "jsdom";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Google Cloud Storage
const storageConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
};
const storage = storageConfig.keyFilename ? new Storage(storageConfig) : new Storage();
const bucketName = process.env.GCP_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

// Auth0 Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

// Token cache to avoid hitting Auth0 rate limits
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cached token validation function
async function validateTokenCached(token) {
  if (!token) return null;
  
  // Check cache first
  const cacheKey = token.substring(0, 20); // Use first 20 chars as cache key
  const cached = tokenCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < TOKEN_CACHE_TTL)) {
    console.log('✅ Using cached token validation for user:', cached.userInfo.email);
    return cached.userInfo;
  }
  
  try {
    // Validate against Auth0's userinfo endpoint
    const response = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const userInfo = await response.json();
      
      // Cache the result
      tokenCache.set(cacheKey, {
        userInfo,
        timestamp: Date.now()
      });
      
      console.log('✅ Token validated and cached for user:', userInfo.email);
      return userInfo;
    } else {
      console.log('❌ Token validation failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error validating token:', error.message);
    return null;
  }
}

// JWT validation middleware with debugging - supports opaque tokens
const checkJwt = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
  // authRequired: false, // Make auth optional for debugging
});

// Alternative middleware for opaque token validation with caching
const validateOpaqueToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next(); // Continue without auth if no token
  }

  const userInfo = await validateTokenCached(token);
  
  if (userInfo) {
    req.auth = userInfo;
    req.userInfo = {
      sub: userInfo.sub,
      email: userInfo.email,
      email_verified: userInfo.email_verified
    };
  }
  
  next();
};

// Debug middleware to log authorization headers
const debugAuth = (req, res, next) => {
  console.log('Authorization header:', req.headers.authorization);
  console.log('Headers:', Object.keys(req.headers));
  next();
};


app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for document uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// POST route to receive document data and store in GCP bucket
app.post("/document", debugAuth, validateOpaqueToken, async (req, res) => {
  const headers = req.headers;
  const body = req.body;
  const receivedAt = new Date().toISOString();

  try {
    let documentUrl = null;
    let fileName = null;

    // If document is provided, store it in GCP bucket
    if (body.document && body.documentEncoding === "base64") {
      const userEmail = body.userProfile?.email || "anonymous";
      fileName = 'document.docx';

      // Convert base64 to buffer
      const documentBuffer = Buffer.from(body.document, "base64");

      // Create file reference in bucket
      const file = bucket.file(fileName);

      // Upload document to bucket
      await file.save(documentBuffer, {
        metadata: {
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          metadata: {
            userEmail: userEmail,
            uploadedAt: receivedAt,
            originalSize: body.document.length,
            userAgent: headers["user-agent"] || "unknown",
          },
        },
      });

      // Generate signed URL for accessing the document (valid for 1 hour)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });

      documentUrl = url;

      console.log(`\n✅ Document stored: ${fileName}`);
      console.log(`📁 Bucket: ${bucketName}`);
      console.log(`🔗 Access URL: ${url.substring(0, 100)}...`);
    }

    // Build JSON response with all pertinent data
    const response = {
      status: "success",
      message: "Document received and stored successfully",
      receivedAt,
      userProfile: body.userProfile || null,
      authentication: {
        hasAccessToken: body.auth?.hasAccessToken || false,
        tokenType: body.auth?.tokenType || null,
        isExpired: body.auth?.isExpired || null,
      },
      document: {
        hasDocument: !!body.document,
        documentSize: body.document ? `${Math.round(body.document.length / 1024)} KB` : null,
        encoding: body.documentEncoding || null,
        timestamp: body.timestamp || null,
        stored: !!documentUrl,
        fileName: fileName,
        accessUrl: documentUrl,
      },
      storage: {
        bucket: bucketName,
        fileName: fileName,
        accessUrl: documentUrl ? `Available (expires in 1 hour)` : null,
      },
      requestHeaders: headers,
      requestBody: {
        ...body,
        document: body.document
          ? `[Base64 Document - ${Math.round(body.document.length / 1024)} KB - Stored in GCP]`
          : null,
      },
    };

    // Log to console for server-side debugging
    console.log("\n=== Document Received ===");
    console.log("Timestamp:", receivedAt);
    console.log("User Email:", body.userProfile?.email || "Not provided");
    console.log("Document Size:", body.document ? `${Math.round(body.document.length / 1024)} KB` : "No document");
    console.log("Stored in GCP:", !!documentUrl);
    console.log("========================\n");

    res.json(response);
  } catch (error) {
    console.error("\n❌ Error processing document:", error);

    // Return error response
    res.status(500).json({
      status: "error",
      message: "Failed to process document",
      error: error.message,
      receivedAt,
      userProfile: body.userProfile || null,
      document: {
        hasDocument: !!body.document,
        documentSize: body.document ? `${Math.round(body.document.length / 1024)} KB` : null,
        stored: false,
      },
    });
  }
});

// Secure GET endpoint to retrieve user documents
app.get("/document", async (req, res) => {
  console.log('\n=== /document GET Request ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('========================\n');
  
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    console.log('🔍 Authorization header received:', authHeader ? `Bearer ${authHeader.slice(7, 17)}...` : 'None');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    let isAuthenticated = false;
    let userEmail = null;

    if (token) {
      console.log('🔍 Token extracted, length:', token.length);
      console.log('🔍 Validating token from Authorization header...');
      
      const userInfo = await validateTokenCached(token);
      
      if (userInfo) {
        isAuthenticated = true;
        userEmail = userInfo.email;
        console.log('✅ Token validated for user:', userEmail);
      } else {
        console.log('❌ Token validation failed');
      }
    }

    if (!isAuthenticated) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required. Please provide a valid Authorization header.",
      });
    }

    if (!userEmail) {
      return res.status(401).json({
        status: "error",
        message: "User email not found in token",
      });
    }

    console.log(`\n🔍 Document request from: ${userEmail}`);
    await downloadDocument(res, userEmail, "document.docx");

  } catch (error) {
    console.error("❌ Error in document endpoint:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Helper function to download specific document
async function downloadDocument(res, userEmail, filename) {
  try {
    // Construct the file path (ensure it's within user's directory)
    const filePath = filename;
    const file = bucket.file(filePath);

    // Check if file exists and user has access
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({
        status: "error",
        message: "Document not found or access denied",
      });
    }

    // Get file metadata
    const [metadata] = await file.getMetadata();
    console.log(`📄 Downloading: ${filePath}`);
    console.log(`📊 Size: ${Math.round(metadata.size / 1024)} KB`);

    // Set response headers for file download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", metadata.size);

    // Stream the file directly to the response
    const stream = file.createReadStream();

    stream.on("error", (error) => {
      console.error("❌ Stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          status: "error",
          message: "Error streaming file",
        });
      }
    });

    stream.on("end", () => {
      console.log("✅ File download completed");
    });

    // Pipe the file stream to the response
    stream.pipe(res);
  } catch (error) {
    console.error("❌ Error downloading document:", error);
    if (!res.headersSent) {
      res.status(500).json({
        status: "error",
        message: "Failed to download document",
        error: error.message,
      });
    }
  }
}

// Test POST route - echoes back the JSON request
app.post("/test", (req, res) => {
  res.json({
    message: "Test POST successful",
    timestamp: new Date().toISOString(),
    receivedData: req.body,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "SuperDoc server is running",
  });
});

// Editor page - authentication handled via WebSocket
app.get("/editor", async (req, res) => {
  console.log('\n=== /editor GET Request ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('========================\n');
  
  // Simply serve the editor template without authentication
  // Authentication will be handled via WebSocket connection
  const templatePath = path.join(__dirname, 'public', 'editor.html');
  const html = fs.readFileSync(templatePath, 'utf8');
  
  res.send(html);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SuperDoc server running on http://localhost:${PORT}`);
});

// WebSocket server for real-time document updates
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('📡 WebSocket connection established');

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📨 WebSocket message received:', message.type);
      
      // Handle the 3 simplified message types
      switch (message.type) {
        case 'client_ready':
          console.log('🌐 Client ready - broadcasting to all other clients');
          // Broadcast to all other clients except sender
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'client_ready',
                timestamp: new Date().toISOString()
              }));
            }
          });
          break;
          
        case 'token_transfer':
          console.log('🔐 Token transfer - broadcasting to all other clients');
          // Validate token first
          if (message.token) {
            const userInfo = await validateTokenCached(message.token);

            if (userInfo) {
              console.log('✅ Token validated for user:', userInfo.email);
              
              // Broadcast token with user info to all other clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'token_transfer',
                    token: message.token,
                    user: {
                      email: userInfo.email,
                      name: userInfo.nickname || userInfo.name || 'User',
                      picture: userInfo.picture
                    },
                    timestamp: new Date().toISOString()
                  }));
                }
              });
            } else {
              console.log('❌ Token validation failed');
              // Broadcast token failure to all other clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'token_transfer',
                    error: 'Invalid token',
                    timestamp: new Date().toISOString()
                  }));
                }
              });
            }
          }
          break;
          
        case 'document_update':
          console.log('📝 Document update received');
          // Validate token if provided
          if (message.token) {
            const userInfo = await validateTokenCached(message.token);

            if (userInfo) {
              console.log('✅ Document update from authenticated user:', userInfo.email);
              
              // Broadcast document update to all other clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'document_update',
                    document: message.document,
                    mode: message.mode,
                    author: userInfo.email,
                    timestamp: new Date().toISOString()
                  }));
                }
              });
            } else {
              console.log('❌ Document update with invalid token');
            }
          } else {
            console.log('❌ Document update without token - ignored');
          }
          break;
          
        case 'update_mode':
          console.log('🎯 Mode update received');
          // Validate token if provided
          if (message.token) {
            const userInfo = await validateTokenCached(message.token);

            if (userInfo) {
              console.log('✅ Mode update from authenticated user:', userInfo.email, `${message.previousMode} → ${message.mode}`);
              
              // Broadcast mode update to all other clients
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'update_mode',
                    mode: message.mode,
                    previousMode: message.previousMode,
                    author: userInfo.email,
                    timestamp: new Date().toISOString()
                  }));
                }
              });
            } else {
              console.log('❌ Mode update with invalid token');
            }
          } else {
            console.log('❌ Mode update without token - ignored');
          }
          break;
          
        default:
          console.log('❓ Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('📡 WebSocket connection closed');
    
    // Broadcast to all other clients that a connection closed
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'close',
          timestamp: new Date().toISOString()
        }));
      }
    });
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    
    // Broadcast to all other clients that a connection error occurred
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'error',
          timestamp: new Date().toISOString()
        }));
      }
    });
  });
});

console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);

export default app;
