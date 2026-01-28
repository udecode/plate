/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* eslint-disable prettier/prettier */
/* global document, Office, Word */
/* eslint-disable no-use-before-define */

import SERVER_DOMAIN from '../server-domain.js';

let webAuth = null;
let userProfile = null;

Office.onReady((info) => {
  try {
    if (info.host !== Office.HostType.Word) return;

    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    
    const clickHandlers = {
      "openLoginDialog": openLoginDialog,
      "getDocument": loadSampleDocument,
      "sendDocument": sendDocumentAndOpenStatus,
      "logout": logout
    };
    
    Object.entries(clickHandlers).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.onclick = handler;
      }
    });
    
    // Initialize Auth0
    initializeAuth0();
    handleAuthCallback();
    checkAuthState();
    
    // Log current tracking mode and start monitoring
    logTrackingMode();
    startTrackingModeMonitor();

    updateStatus(`URL: ${window.location.href}`);
  } catch (error) {
    console.error("Error in Office.onReady:", error);
    updateStatus("Error initializing application: " + error.message);
  }
});


// Update debug info in the task pane
const debugMode = false;
function updateStatus(message) {
  if (!debugMode) return; // Skip if debug mode is off
  try {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      const messageElement = document.createElement('div');
      messageElement.textContent = "- " + message;
      statusElement.appendChild(document.createElement('br'));
      statusElement.appendChild(messageElement);
    } else {
      console.log("Status:", message);
    }
  } catch (error) {
    console.log("Status:", message);
    console.error("Error updating status:", error);
  }
}

// Connection status indicator functions
function createTaskpaneConnectionStatus() {
  let statusElement = document.getElementById('connection-status-taskpane');
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'connection-status-taskpane';
    statusElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      font-family: "Segoe UI", sans-serif;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #e1e5e9;
    `;
    
    statusElement.innerHTML = `
      <div id="connection-dot-taskpane" style="
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ccc;
      "></div>
      <span id="connection-text-taskpane">Connecting...</span>
    `;
    
    // Add CSS animation for sync pulse and mode wobble
    if (!document.getElementById('taskpane-sync-animations-style')) {
      const style = document.createElement('style');
      style.id = 'taskpane-sync-animations-style';
      style.textContent = `
        @keyframes taskpaneSyncPulse {
          0% { 
            box-shadow: 0 0 0 0 rgba(18, 85, 254, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 4px rgba(18, 85, 254, 0.3);
            transform: scale(1.2);
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(18, 85, 254, 0);
            transform: scale(1);
          }
        }
        @keyframes modeIndicatorWobble {
          0% { 
            transform: scale(1) rotate(0deg);
          }
          10% { 
            transform: scale(1.3) rotate(-5deg);
          }
          20% { 
            transform: scale(1.3) rotate(5deg);
          }
          30% { 
            transform: scale(1.3) rotate(-5deg);
          }
          40% { 
            transform: scale(1.3) rotate(5deg);
          }
          50% { 
            transform: scale(1.3) rotate(-2deg);
          }
          60% { 
            transform: scale(1.3) rotate(2deg);
          }
          70% { 
            transform: scale(1.2) rotate(0deg);
          }
          100% { 
            transform: scale(1) rotate(0deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(statusElement);
  }
}

function updateTaskpaneConnectionStatus(status, color) {
  const dot = document.getElementById('connection-dot-taskpane');
  const text = document.getElementById('connection-text-taskpane');
  
  if (dot && text) {
    dot.style.background = color;
    dot.style.animation = ''; // Remove any existing animation
    text.textContent = status;
    text.style.color = color;
  }
}

function showTaskpaneSyncingStatus() {
  const dot = document.getElementById('connection-dot-taskpane');
  const text = document.getElementById('connection-text-taskpane');
  
  if (dot && text) {
    dot.style.background = '#28a745';
    dot.style.animation = 'taskpaneSyncPulse 1.5s ease-out';
    text.textContent = 'Syncing...';
    text.style.color = '#28a745';

    // Revert to Connected after animation
    setTimeout(() => {
      if (dot && text) {
        dot.style.animation = '';
        text.textContent = 'Connected';
      }
    }, 1500);
  }
}

function createTaskpaneModeIndicator() {
  let modeElement = document.getElementById('mode-indicator-taskpane');
  if (!modeElement) {
    modeElement = document.createElement('div');
    modeElement.id = 'mode-indicator-taskpane';
    modeElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      font-family: "Segoe UI", sans-serif;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #e1e5e9;
    `;
    
    modeElement.innerHTML = `
      <i id="mode-icon-taskpane" class="fas fa-pencil-alt" style="font-size: 10px; color: #1255fe;"></i>
      <span id="mode-text-taskpane">Editing</span>
    `;
    
    document.body.appendChild(modeElement);
  }
}

function updateTaskpaneModeIndicator(mode) {
  const icon = document.getElementById('mode-icon-taskpane');
  const text = document.getElementById('mode-text-taskpane');
  
  if (icon && text) {
    const modeConfig = {
      'editing': { icon: 'fas fa-pencil-alt', text: 'Editing', color: '#1255fe' },
      'suggesting': { icon: 'fas fa-comment', text: 'Suggesting', color: '#ff8800' },
      'viewing': { icon: 'fas fa-eye', text: 'Viewing', color: '#28a745' }
    };
    
    const config = modeConfig[mode] || modeConfig['editing'];
    icon.className = config.icon;
    icon.style.color = config.color;
    text.textContent = config.text;
    text.style.color = config.color;
  }
}

function wobbleTaskpaneModeIndicator() {
  const modeElement = document.getElementById('mode-indicator-taskpane');
  if (modeElement) {
    // Apply wobble animation
    modeElement.style.animation = 'modeIndicatorWobble 0.8s ease-out';
    
    // Remove animation after completion
    setTimeout(() => {
      if (modeElement) {
        modeElement.style.animation = '';
      }
    }, 800);
  }
}





//Load sample document from assets
export async function loadSampleDocument() {
  updateStatus("Loading sample document...");
  try {
    const response = await fetch('./assets/sample-document.docx');
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    updateStatus("Sample document fetched, inserting into Word...");
    
    await Word.run(async (context) => {
      context.document.insertFileFromBase64(base64String, "Replace", {
        importTheme: true,
        importStyles: true,
        importParagraphSpacing: true,
        importPageColor: true,
        importChangeTrackingMode: true,
        importCustomProperties: true,
        importCustomXmlParts: true,
        importDifferentOddEvenPages: true
      });
      await context.sync();
    });
    
    updateStatus("Sample document loaded successfully!");
  } catch (error) {
    updateStatus(`Error loading sample document: ${error.message}`);
    console.error("Sample document load error:", error);
  }
}


//Send document and auth data to server
export async function sendDocumentToServer() {
  updateStatus("Preparing to send document to server...");

  try {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token');
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
    const isTokenValid = accessToken && new Date().getTime() < expiresAt;
    
    if (!isTokenValid) {
      updateStatus("❌ User not authenticated. Please login first.");
      return;
    }
    
    updateStatus("✅ User authenticated. Getting document...");
    
    // Get current document as base64
    await Word.run(async (context) => {
      return new Promise((resolve, reject) => {
        Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 65536 }, 
          async function (result) {
            if (result.status !== "succeeded") {
              updateStatus("❌ Error getting document");
              reject(new Error("Failed to get document"));
              return;
            }

            const myFile = result.value;
            const sliceCount = myFile.sliceCount;
            const docDataSlices = [];
            let slicesReceived = 0;
            
            updateStatus(`📄 Document size: ${myFile.size} bytes, ${sliceCount} slices`);

            // Function to get all slices in parallel
            const getAllSlices = async () => {
              const slicePromises = [];
              
              // Create promises for all slices
              for (let i = 0; i < sliceCount; i++) {
                slicePromises.push(
                  new Promise((resolveSlice, rejectSlice) => {
                    myFile.getSliceAsync(i, function (sliceResult) {
                      if (sliceResult.status === "succeeded") {
                        resolveSlice({
                          index: sliceResult.value.index,
                          data: sliceResult.value.data
                        });
                      } else {
                        rejectSlice(new Error(`Failed to get slice ${i}`));
                      }
                    });
                  })
                );
              }
              
              try {
                // Wait for all slices to complete
                const sliceResults = await Promise.all(slicePromises);
                
                // Sort slices by index to ensure correct order
                sliceResults.sort((a, b) => a.index - b.index);
                
                // Combine all slice data into a single buffer
                const totalBytes = sliceResults.reduce((sum, slice) => sum + slice.data.length, 0);
                const docData = new Uint8Array(totalBytes);
                let offset = 0;
                
                for (const slice of sliceResults) {
                  docData.set(slice.data, offset);
                  offset += slice.data.length;
                }
                
                // Convert to base64 more efficiently
                let binary = '';
                for (let i = 0; i < docData.length; i++) {
                  binary += String.fromCharCode(docData[i]);
                }
                const base64Document = btoa(binary);
                
                myFile.closeAsync();
                updateStatus("📤 Sending document and auth data to server...");
                sendToServer(base64Document).then(resolve).catch(reject);
              } catch (error) {
                myFile.closeAsync();
                reject(error);
              }
            };

            getAllSlices();
          }
        );
      });
    });
    
  } catch (error) {
    updateStatus(`❌ Error sending document: ${error.message}`);
    console.error("Send document error:", error);
  }
}

// Send document to server then open status page with auth token
export async function sendDocumentAndOpenStatus() {
  updateStatus("🚀 Starting document upload and status flow...");
  
  try {
    // First, send the document to server
    updateStatus("📤 Step 1: Sending document to server...");
    await sendDocumentToServer();
    updateStatus("✅ Step 1 complete: Document sent successfully!");
    
    // Wait a moment for server processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get auth token for WebSocket communication
    const accessToken = localStorage.getItem('access_token');
    updateStatus("🔐 Step 2: Opening editor page with WebSocket authentication...");

    // Create a form to POST to the editor page with auth token
    const editorUrl = `${SERVER_DOMAIN}/editor`;
    updateStatus(`🌐 Opening: ${editorUrl}`);

    // Open editor without token in URL for security
    updateStatus("🌐 Opening editor page...");
    Office.context.ui.openBrowserWindow(editorUrl);
    
    updateStatus("✅ Document upload and status flow completed!");
    
    // Open WebSocket connection to listen for document updates
    updateStatus("🔌 Opening WebSocket connection for live updates...");
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${new URL(SERVER_DOMAIN).host}`;
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = (event) => {
        updateStatus("✅ WebSocket connected - waiting for browser ready signal");
        console.log('🔌 WebSocket connection opened', event);
        createTaskpaneConnectionStatus();
        updateTaskpaneConnectionStatus('Connected', '#28a745');
        createTaskpaneModeIndicator();
        updateTaskpaneModeIndicator(currentViewMode);
        
        // Set up Word document change listeners
        setupWordDocumentChangeListeners(websocket);
      };
      
      websocket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          updateStatus(`📨 WebSocket message received: ${message?.type || 'NO MESSAGE TYPE'}`);
          
          // Handle different message types
          switch (message.type) {
            case 'client_ready':
              updateStatus("🌐 Browser ready - sending authentication token");
              console.log('🌐 Browser client ready, sending auth token');
              
              // Send authentication token (server will validate)
              websocket.send(JSON.stringify({
                type: 'token_transfer',
                token: accessToken
              }));
              updateStatus("🔐 Authentication token sent via WebSocket");
              break;
              
            case 'document_update':
              const token = localStorage.getItem('access_token');
              if (!token) {
                updateStatus("⚠️ User not authenticated - skipping document update");
                console.log('📝 Document update skipped - user not authenticated');
                return;
              }

              // Check if we're in viewing mode - if so, prevent document updates
              if (currentViewMode === 'viewing') {
                updateStatus("📖 Document update blocked - in viewing mode");
                console.log('📝 Document update skipped - in viewing mode');
                return;
              }

              updateStatus(`📡 Document update received from: ${message.author}`);
              console.log('📡 Document update from another client:', message);
              showTaskpaneSyncingStatus(); // Show syncing animation

              // If document data is included, replace the current document
              if (message.document) {
                try {
                  window.isUpdatingFromWebSocket = true;
                  updateStatus(`📥 Updating Word document with new version...`);
                  
                  // Convert base64 to blob and then to base64 for Word
                  const binaryString = atob(message.document);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }

                  let binaryStringForWord = '';
                  for (let i = 0; i < bytes.length; i++) {
                    binaryStringForWord += String.fromCharCode(bytes[i]);
                  }

                  const base64ForWord = btoa(binaryStringForWord);
                  
                  // Replace the document content in Word
                  await Word.run(async (context) => {
                    context.document.insertFileFromBase64(base64ForWord, "Replace", {
                      importTheme: true,
                      importStyles: true,
                      importParagraphSpacing: true,
                      importPageColor: true,
                      importChangeTrackingMode: true,
                      importCustomProperties: true,
                      importCustomXmlParts: true,
                      importDifferentOddEvenPages: true
                    });
                    await context.sync();
                  });
                  window.isUpdatingFromWebSocket = false;
                  
                  updateStatus(`✅ Word document updated successfully from remote changes`);
                } catch (error) {
                  updateStatus(`❌ Failed to update Word document: ${error.message}`);
                  console.error('Error updating Word document:', error);
                }
              }
              break;
            case 'update_mode':
              updateStatus(`🎯 Mode update received: ${message.previousMode} → ${message.mode} (from ${message.author})`);
              console.log(`📝 Received mode update from web editor: ${message.previousMode} → ${message.mode}`);
              
              // Update our tracked view mode
              currentViewMode = message.mode;
              updateTaskpaneModeIndicator(currentViewMode);
              
              // Apply the mode change to Word document if different from current
              if (message.mode !== documentModeMap[currentTrackingMode]) {
                await applyModeToWordDocument(message.mode);
              }
              break;
            case 'close':
              updateStatus('📡 Another client disconnected');
              updateTaskpaneConnectionStatus('Disconnected', '#ff8800');
              break;
            case 'error':
              updateStatus('❌ Connection error occurred');
              updateTaskpaneConnectionStatus('Connection Error', '#dc3545');
              break;
            default:
              console.log('📨 Other WebSocket message:', message);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          updateStatus(`❌ WebSocket message parse error: ${error.message}`);
        }
      };
      
      websocket.onclose = (event) => {
        updateStatus(`🔌 WebSocket connection closed (code: ${event.code})`);
        console.log('🔌 WebSocket connection closed', event);
        updateTaskpaneConnectionStatus('Disconnected', '#ff8800');
      };
      
      websocket.onerror = (error) => {
        updateStatus(`❌ WebSocket error: ${error.message || 'Connection failed'}`);
        console.error('❌ WebSocket error:', error);
        updateTaskpaneConnectionStatus('Connection Error', '#dc3545');
      };
      
      // Store websocket reference globally for potential cleanup
      window.documentWebSocket = websocket;
      
    } catch (error) {
      updateStatus(`❌ Failed to create WebSocket connection: ${error.message}`);
      console.error("WebSocket creation error:", error);
    }
    
  } catch (error) {
    updateStatus(`❌ Error in document and status flow: ${error.message}`);
    console.error("Document and status flow error:", error);
  }
}

// Set up Word document change listeners for real-time collaboration
async function setupWordDocumentChangeListeners(websocket) {
  try {
    updateStatus("📝 Setting up Word document change detection...");
    
    // Since onContentChanged is not available, we'll use a different approach
    // Option 1: Use document selection change events
    try {
      await Word.run(async (context) => {
        // Listen for selection changes as a proxy for document changes
        Office.context.document.addHandlerAsync(
          Office.EventType.DocumentSelectionChanged,
          async function(args) {
            try {
              console.log('📝 Word document selection changed, checking for content changes');
              
              // If we're in viewing mode, show wobble animation and skip document sync
              if (currentViewMode === 'viewing') {
                console.log('📖 Document change detected in viewing mode - showing feedback');
                updateStatus("📖 Edit blocked - in viewing mode");
                
                // Wobble the mode indicator to show the user they can't edit
                wobbleTaskpaneModeIndicator();
                return;
              }
              
              // Skip if we're currently updating from a WebSocket message
              if (window.isUpdatingFromWebSocket) {
                console.log('⏭️ Skipping selection change - currently updating from WebSocket');
                return;
              }
              
              // Debounce rapid changes
              if (window.documentChangeTimeout) {
                clearTimeout(window.documentChangeTimeout);
              }
              
              window.documentChangeTimeout = setTimeout(async () => {
                try {
                  // Double-check we're not updating from WebSocket
                  if (window.isUpdatingFromWebSocket) {
                    console.log('⏭️ Skipping debounced update - currently updating from WebSocket');
                    return;
                  }
                  
                  // Double-check viewing mode in case it changed during debounce
                  if (currentViewMode === 'viewing') {
                    console.log('📖 Document update blocked during debounce - in viewing mode');
                    return;
                  }
                  
                  updateStatus("📝 Document may have changed - broadcasting update...");
                  
                  // Get the current document as base64
                  const documentBase64 = await getWordDocumentAsBase64();

                  const accessToken = localStorage.getItem('access_token');
                  
                  // Check if user is still authenticated before sending updates
                  if (!accessToken || !userProfile) {
                    updateStatus("⚠️ User logged out - skipping document update");
                    console.log('📝 Document update skipped - user not authenticated');
                    return;
                  }
                  
                  // Send update via WebSocket (server will validate token)
                  if (websocket && websocket.readyState === WebSocket.OPEN) {
                    websocket.send(JSON.stringify({
                      type: 'document_update',
                      token: accessToken,
                      document: documentBase64
                    }));
                    updateStatus("📤 Word document update sent to server");
                  } else {
                    updateStatus("⚠️ WebSocket not available for sending Word update");
                  }
                } catch (error) {
                  updateStatus(`❌ Error handling Word document change: ${error.message}`);
                  console.error('Error in document change handler:', error);
                }
              }, 1000); // Wait 1 second after last selection change
              
            } catch (error) {
              console.error('Error in selection change handler:', error);
            }
          }
        );
        
        await context.sync();
        updateStatus("✅ Word document change detection active (using selection events)");
      });
    } catch (error) {
      updateStatus(`❌ Selection change events not available, trying alternative approach...`);
      console.error('Selection change error:', error);
      
      // Option 2: Manual broadcasting with button trigger
      updateStatus("📝 Manual document sync mode - use 'Send doc' button to broadcast changes");
    }
    
  } catch (error) {
    updateStatus(`❌ Failed to set up document change listeners: ${error.message}`);
    console.error('Error setting up document change listeners:', error);
  }
}

// Helper function to get Word document as base64
async function getWordDocumentAsBase64() {
  return new Promise((resolve, reject) => {
    Office.context.document.getFileAsync(Office.FileType.Compressed, { sliceSize: 65536 }, 
      async function (result) {
        if (result.status !== "succeeded") {
          reject(new Error("Failed to get document"));
          return;
        }

        const myFile = result.value;
        const sliceCount = myFile.sliceCount;
        
        try {
          // Get all slices in parallel
          const slicePromises = [];
          
          for (let i = 0; i < sliceCount; i++) {
            slicePromises.push(
              new Promise((resolveSlice, rejectSlice) => {
                myFile.getSliceAsync(i, function (sliceResult) {
                  if (sliceResult.status === "succeeded") {
                    resolveSlice({
                      index: sliceResult.value.index,
                      data: sliceResult.value.data
                    });
                  } else {
                    rejectSlice(new Error(`Failed to get slice ${i}`));
                  }
                });
              })
            );
          }
          
          const sliceResults = await Promise.all(slicePromises);
          
          // Sort slices by index and combine data
          sliceResults.sort((a, b) => a.index - b.index);
          
          const totalBytes = sliceResults.reduce((sum, slice) => sum + slice.data.length, 0);
          const docData = new Uint8Array(totalBytes);
          let offset = 0;
          
          for (const slice of sliceResults) {
            docData.set(slice.data, offset);
            offset += slice.data.length;
          }
          
          // Convert to base64
          let binary = '';
          for (let i = 0; i < docData.length; i++) {
            binary += String.fromCharCode(docData[i]);
          }
          const base64Document = btoa(binary);
          
          myFile.closeAsync();
          resolve(base64Document);
          
        } catch (error) {
          myFile.closeAsync();
          reject(error);
        }
      }
    );
  });
}



// Helper function to send data to server with secure auth handling
async function sendToServer(base64Document) {
  try {
    const accessToken = localStorage.getItem('access_token');
    const userProfileStr = localStorage.getItem('user_profile');
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
    
    // Prepare secure auth data (don't send raw tokens)
    const authData = {
      hasAccessToken: !!accessToken,
      tokenType: 'Bearer',
      isExpired: new Date().getTime() >= expiresAt,
      // Only send a truncated version of the token for verification purposes
      tokenPreview: accessToken ? accessToken.substring(0, 10) + '...' : null
    };
    
    // Prepare user profile (remove sensitive fields)
    let sanitizedUserProfile = null;
    if (userProfileStr) {
      const fullProfile = JSON.parse(userProfileStr);
      sanitizedUserProfile = {
        email: fullProfile.email,
        name: fullProfile.name,
        nickname: fullProfile.nickname,
        email_verified: fullProfile.email_verified,
        picture: fullProfile.picture,
        updated_at: fullProfile.updated_at
        // Deliberately exclude: sub, access tokens, and other sensitive data
      };
    }
    
    // Prepare payload
    const payload = {
      timestamp: new Date().toISOString(),
      userProfile: sanitizedUserProfile,
      auth: authData,
      document: base64Document,
      documentEncoding: 'base64',
      metadata: {
        source: 'MS Word Add-in',
        version: '1.0.0',
        userAgent: navigator.userAgent
      }
    };
    
    updateStatus("🔐 Sending secure payload to server...");
    
    // Send to local server using fetch
    const response = await fetch(`${SERVER_DOMAIN}/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Timestamp': new Date().toISOString(),
        'X-User-Agent': 'SuperDoc-MS-Word-Addin/1.0.0'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      updateStatus("✅ Document sent successfully");
    } else {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      updateStatus(`❌ Could not connect to server. Is the server running on ${SERVER_DOMAIN}?`);
      updateStatus("💡 Run 'npm run server' to start the server");
    } else {
      updateStatus(`❌ Server communication error: ${error.message}`);
    }
    throw error;
  }
}

// Auth0 Functions
function initializeAuth0() {
  try {
    if (typeof auth0 === 'undefined') {
      updateStatus("Auth0 library not loaded");
      return;
    }
    
    const config = auth0Config;
  
    // Debug current origin information
    updateStatus(`Current origin: ${window.location.origin}`);
    updateStatus(`Redirect URI: ${config.redirectUri}`);
    
    webAuth = new auth0.WebAuth({
      domain: config.domain,
      clientID: config.clientId,
      redirectUri: config.redirectUri,
      responseType: config.responseType,
      scope: config.scope,
      leeway: config.leeway
    });

    updateStatus("✅ Auth0 initialized successfully");
    updateStatus(`Domain: ${config.domain}`);
    updateStatus(`Client ID: ${config.clientId.substring(0,8)}...`);
  } catch (error) {
    updateStatus("Error initializing Auth0: " + error.message);
    console.error("Auth0 initialization error:", error);
  }
}

function handleAuthCallback() {
  // Check if we're returning from Auth0 callback
  if (!window.location.hash) return;

  webAuth.parseHash(function(err, authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      updateStatus("Authentication successful!");
      // Store tokens
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime()));
      
      // Get user profile
      webAuth.client.userInfo(authResult.accessToken, function(err, user) {
        if (user) {
          userProfile = user;
          localStorage.setItem('user_profile', JSON.stringify(user));
          updateStatus("User logged in: " + user.email);
          updateAuthUI(true, user);
        }
      });
      
      // Clear hash
      window.location.hash = '';
    } else if (err) {
      updateStatus("Authentication error: " + err.error_description);
      console.error("Auth error:", err);
    }
  });
}

function checkAuthState() {
  const token = localStorage.getItem('access_token');
  const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
  const userProfileStr = localStorage.getItem('user_profile');
  
  if (token && new Date().getTime() < expiresAt) {
    // User is authenticated
    if (userProfileStr) {
      userProfile = JSON.parse(userProfileStr);
      updateAuthUI(true, userProfile);
    }
  } else {
    // User is not authenticated or token expired
    updateStatus("User not authenticated");
    updateAuthUI(false);
    // Clear stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user_profile');
  }
}

function updateAuthUI(isLoggedIn, user = null) {
  const loginBtn = document.getElementById("openLoginDialog");
  const userInfo = document.getElementById("userInfo");
  const userJsonDisplay = document.getElementById("userJsonDisplay");
  
  if (isLoggedIn && user) {
    // User is logged in - show user info, hide login button
    loginBtn.style.display = "none";
    userInfo.style.display = "block";
    
    // Populate user card details
    if (typeof user === 'string') {
      // If user is just an email string (for backward compatibility)
      document.getElementById("userEmail").textContent = user;
      document.getElementById("userDisplayName").textContent = 'Welcome back!';
    } else {
      // If user is an object with full profile - populate the card
      document.getElementById("userEmail").textContent = user.email || 'Not provided';
      document.getElementById("userDisplayName").textContent = user.nickname || 'Welcome back!';
      document.getElementById("userNickname").textContent = user.nickname || 'Not provided';
      document.getElementById("userEmailVerified").textContent = user.email_verified ? '✅ Yes' : '❌ No';
      document.getElementById("userSub").textContent = user.sub || 'Not provided';
      
      // Format updated date
      if (user.updated_at) {
        const updatedDate = new Date(user.updated_at).toLocaleDateString();
        document.getElementById("userUpdated").textContent = updatedDate;
      } else {
        document.getElementById("userUpdated").textContent = 'Not provided';
      }
      
      // Set user picture
      const userPicture = document.getElementById("userPicture");
      if (user.picture && user.picture.trim() !== '') {
        userPicture.src = user.picture;
        userPicture.style.display = 'block';
      } else {
        // Set src to # and hide the image if no picture available
        userPicture.src = '#';
        userPicture.style.display = 'none';
      }
    }
    
    updateStatus("Logged in as: " + (typeof user === 'string' ? user : user.email));
  } else {
    // User is not logged in - show login button, hide user info and JSON display
    loginBtn.style.display = "block";
    userInfo.style.display = "none";
    if (userJsonDisplay) {
      userJsonDisplay.style.display = "none";
    }
  }
}

// Office Dialog Login Function
function openLoginDialog() {
  updateStatus("🔐 Opening login dialog...");
  
  const dialogUrl = window.location.origin + "/auth-dialog.html";
  updateStatus(`Dialog URL: ${dialogUrl}`);
  
  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 60, width: 30, requireHTTPS: true },
    function(result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const dialog = result.value;
        updateStatus("✅ Auth dialog opened successfully");
        
        // Listen for messages from the dialog
        dialog.addEventHandler(Office.EventType.DialogMessageReceived, function(arg) {
          try {
            // Handle manual close message
            if (arg.message === 'close') {
              updateStatus("🔒 Dialog manually closed");
              dialog.close();
              return;
            }
            
            const message = JSON.parse(arg.message);
            
            // Handle debug messages from dialog
            if (message.debug) {
              const timestamp = new Date(message.timestamp).toLocaleTimeString();
              
              // Special handling for verification response JSON
              if (message.step === 'verification_response_json') {
                updateStatus(`[${timestamp}] 🔍 Code Verification Response JSON:`);
                updateStatus(JSON.stringify(message.responseJson, null, 2));
              } else {
                updateStatus(`[${timestamp}] 🔍 ${message.step}: ${JSON.stringify(message).substring(0, 200)}${JSON.stringify(message).length > 200 ? '...' : ''}`);
              }
              return;
            }
            
            // Handle final authentication result
            if (message.success) {
              updateStatus("🎉 Authentication successful!");
              updateStatus(`User: ${message.user.email}`);
              
              // Store tokens
              localStorage.setItem('access_token', message.accessToken);
              localStorage.setItem('id_token', message.idToken);
              localStorage.setItem('expires_at', JSON.stringify((message.expiresIn * 1000) + new Date().getTime()));
              localStorage.setItem('user_profile', JSON.stringify(message.user));
              
              
              // Set user picture from login info
              const userPicture = document.getElementById('userPicture');
              if (userPicture && message.user.picture) {
                userPicture.src = message.user.picture;
              }
              
              // Update UI with user info
              userProfile = message.user;
              updateAuthUI(true, message.user);
              updateStatus("🔐 Login complete!");
              
            } else if (message.success === false) {
              updateStatus("❌ Authentication failed: " + message.error);
            }
            
          } catch (error) {
            updateStatus("❌ Error processing message: " + error.message);
            updateStatus("Raw message: " + arg.message.substring(0, 500));
            // Don't automatically close dialog for debugging
            // dialog.close();
          }
        });
        
        // Handle dialog events
        dialog.addEventHandler(Office.EventType.DialogEventReceived, function(arg) {
          if (arg.error === 12006) {
            // User closed dialog
            updateStatus("ℹ️ Auth dialog was closed by user");
          } else {
            updateStatus("❌ Dialog error: " + arg.error);
          }
        });
        
      } else {
        updateStatus("❌ Failed to open auth dialog: " + result.error.message);
        console.error("Dialog open error:", result.error);
      }
    }
  );
}

async function logout() {
  try {
    updateStatus("Logging out...");
    
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user_profile');
    userProfile = null;

    updateStatus("Logged out successfully");
    updateAuthUI(false);
    
  } catch (error) {
    updateStatus("Error logging out: " + error.message);
    console.error("Logout error:", error);
  }
}

// Track the current tracking mode
let currentTrackingMode = null;
let currentViewMode = 'editing'; // Track current view mode from web editor (editing, suggesting, viewing)

// Map tracking modes and readonly states to user-friendly names
const documentModeMap = {
  'off': 'editing',
  'trackall': 'suggesting', 
  'trackmineonly': 'suggesting',
  'off-readonly': 'viewing',
  'trackall-readonly': 'viewing',
  'trackmineonly-readonly': 'viewing'
};

// Log current document tracking mode
async function logTrackingMode() {
  try {
    await Word.run(async (context) => {
      context.document.load("changeTrackingMode");
      await context.sync();
      
      const mode = context.document.changeTrackingMode;
      currentTrackingMode = mode;
      console.log("📝 Current document tracking mode:", mode);
      updateStatus(`Document tracking mode: ${mode}`);
    });
  } catch (error) {
    console.error("Error getting tracking mode:", error);
    updateStatus(`Error getting tracking mode: ${error.message}`);
  }
}

// Monitor tracking mode changes
async function monitorTrackingModeChanges() {
  try {
    await Word.run(async (context) => {
      context.document.load("changeTrackingMode");
      await context.sync();
      
      const mode = context.document.changeTrackingMode;
      
      // Try a simple approach: attempt to insert and immediately delete text to test if we can edit
      let isReadOnly = false;
      try {
        const testRange = context.document.body.insertText("", Word.InsertLocation.end);
        await context.sync();
        testRange.delete();
        await context.sync();
        isReadOnly = false;
      } catch (editError) {
        console.log("📋 Cannot edit document:", editError.message);
        isReadOnly = true;
      }
      
      const currentState = isReadOnly ? `${mode}-readonly` : mode;
      const currentStateLower = currentState.toLowerCase();
      const friendlyState = documentModeMap[currentStateLower] || currentState;

      console.log(`📊 Document state: tracking=${mode}, readonly=${isReadOnly}, mode=${friendlyState}`);
      
      if (currentTrackingMode !== null && currentTrackingMode !== currentState) {
        const currentTrackingModeLower = currentTrackingMode.toLowerCase();
        const oldFriendlyState = documentModeMap[currentTrackingModeLower] || currentTrackingModeLower;
        console.log(`📝 Document mode changed from "${oldFriendlyState}" to "${friendlyState}" (${currentTrackingMode} → ${currentState})`);
        updateStatus(`Mode changed: ${oldFriendlyState} → ${friendlyState}`);
        
        // Send mode change via WebSocket if connected (only if state actually changed)
        if (oldFriendlyState !== friendlyState && window.documentWebSocket && window.documentWebSocket.readyState === WebSocket.OPEN) {
          const accessToken = localStorage.getItem('access_token');
          if (accessToken && userProfile) {
            window.documentWebSocket.send(JSON.stringify({
              type: 'update_mode',
              token: accessToken,
              mode: friendlyState,
              previousMode: oldFriendlyState
            }));
            console.log(`📤 Sent mode update via WebSocket: ${oldFriendlyState} → ${friendlyState}`);
          }
        }
        
        // Update our local view mode
        if (oldFriendlyState !== friendlyState) {
          currentViewMode = friendlyState;
          updateTaskpaneModeIndicator(currentViewMode);
        }
        
        currentTrackingMode = currentState;
      }
    });
  } catch (error) {
    console.error("Error monitoring tracking mode:", error);
  }
}

// Start monitoring tracking mode changes every 2 seconds
function startTrackingModeMonitor() {
  setInterval(monitorTrackingModeChanges, 2000);
  console.log("📝 Started tracking mode monitor (polling every 2s)");
}


// Apply mode change from web editor to Word document
async function applyModeToWordDocument(friendlyMode) {
  try {
    console.log(`🎯 Applying mode change to Word: ${friendlyMode}`);
    
    await Word.run(async (context) => {
      // Map friendly mode back to Word tracking mode
      const modeMapping = {
        'editing': 'off',
        'suggesting': 'trackAll',
        'viewing': 'off' // We'll try additional approaches for viewing
      };
      
      const wordMode = modeMapping[friendlyMode];
      if (wordMode) {
        // Set the tracking mode
        context.document.changeTrackingMode = Word.ChangeTrackingMode[wordMode];
        await context.sync();
        
        // Update our tracked view mode
        currentViewMode = friendlyMode;
        updateTaskpaneModeIndicator(currentViewMode);
        
        // Special handling for viewing mode
        if (friendlyMode === 'viewing') {
          console.log('📖 Viewing mode enabled - document updates will be blocked');
          updateStatus('📖 Viewing mode: Document updates from web editor are now blocked');
          updateStatus('💡 Tip: Use View → Reading View in Word for full preview mode');
        } else {
          console.log(`📝 ${friendlyMode} mode enabled - document updates allowed`);
          updateStatus(`📝 ${friendlyMode} mode: Document updates from web editor are allowed`);
        }
        
        console.log(`✅ Word document mode set to: ${wordMode} (${friendlyMode})`);
        updateStatus(`Mode applied from web editor: ${friendlyMode}`);
        
      } else {
        console.log(`⚠️ Unknown mode mapping for: ${friendlyMode}`);
      }
    });
  } catch (error) {
    console.error('❌ Error applying mode to Word document:', error);
    updateStatus(`Error applying mode: ${error.message}`);
  }
}