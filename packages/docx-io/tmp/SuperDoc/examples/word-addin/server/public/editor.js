window.__IS_DEBUG__ = false;

const debugMode = true;
const logMessage = (...message) => {
    if (!debugMode) return;
    console.log(...message);
}

logMessage('Editor page loaded - waiting for WebSocket authentication');

// Global state
let superdocInstance = null;
let isAuthenticated = false;
let authToken = null;
let authTimeout = null;
let currentDocumentMode = 'editing'; // Track current document mode

// Status indicator functions using class-based approach
function updateStatusIndicator(status) {
    // Status mappings
    const statusMap = {
        'connecting': { class: 'status-connecting', text: 'Connecting...' },
        'connected': { class: 'status-connected', text: 'Connected' },
        'syncing': { class: 'status-syncing', text: 'Syncing...' },
        'disconnected': { class: 'status-disconnected', text: 'Disconnected' },
        'error': { class: 'status-error', text: 'Connection Error' },
        'blocked': { class: 'status-error', text: 'Edit Blocked - Viewing Mode' },
        'timeout': { class: 'status-disconnected', text: 'Connection Timeout' }
    };
    
    const statusIndicator = document.getElementById('status-indicator');
    const statusTextElement = statusIndicator?.querySelector('.status-text');
    
    if (statusIndicator && statusTextElement && statusMap[status]) {
        const { class: statusClass, text: statusText } = statusMap[status];
        
        // Remove all status classes
        statusIndicator.className = 'status-indicator-container';
        // Add new status class
        statusIndicator.classList.add(statusClass);
        // Update text
        statusTextElement.textContent = statusText;
        
        logMessage(`Status updated: ${status} (${statusClass}) - ${statusText}`);
    } else if (!statusMap[status]) {
        console.warn(`Unknown status: ${status}`);
    }
}

function showSyncingStatus() {
    updateStatusIndicator('syncing');
    
    // Revert to Connected after animation
    setTimeout(() => {
        updateStatusIndicator('connected');
    }, 1500);
}

function showWobbleAnimation() {
    const statusIndicator = document.getElementById('status-indicator');
    if (statusIndicator) {
        statusIndicator.classList.add('status-wobble');
        
        // Remove wobble class after animation
        setTimeout(() => {
            statusIndicator.classList.remove('status-wobble');
        }, 800);
    }
}

function showViewingModeBlocked() {
    // Temporarily show blocked status with wobble
    updateStatusIndicator('blocked');
    showWobbleAnimation();
    
    // Revert to connected after 2 seconds
    setTimeout(() => {
        updateStatusIndicator('connected');
    }, 2000);
}


// Utility function
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// SuperDoc configuration
const baseConfig = {
    selector: '#superdoc',
    toolbar: '#my-toolbar',
    modules: {
        toolbar: {
            selector: '#my-toolbar',
            responsiveToContainer: true,
            excludeItems: ['documentMode']
        },
        comments: {}
    },
    role: 'editor',
    documentMode: 'editing',
    user: {
        name: 'Superdoc User',
        email: 'superdoc@example.com',
        image: 'image-url.jpg',
    },
    pagination: true,
    rulers: true,
    onReady: () => logMessage('SuperDoc is ready'),
    onEditorUpdate: debounce(async () => {
        if (!window.documentWebSocket || window.documentWebSocket.readyState !== WebSocket.OPEN || !authToken) {
            return;
        }

        try {
            const docxBlob = await superdocInstance.activeEditor.exportDocx();
            const base64Document = await blobToBase64(docxBlob);
            
            window.documentWebSocket.send(JSON.stringify({
                type: 'document_update',
                token: authToken,
                document: base64Document,
                mode: currentDocumentMode
            }));
            
            logMessage('📤 Document update sent via WebSocket');
        } catch (error) {
            console.error('❌ Error sending document update:', error);
        }
    }, 1000),
    onEditorCreate: () => logMessage('Editor created')
};

// Utility functions
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function base64ToBlob(base64, mimeType) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
}

function hideAllContainers() {
    const containers = ['superdoc-container', 'auth-required-container', 'loading-container', 'error-container', 'timeout-container'];
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
}

function createContainer(id, content, styles = '') {
    let container = document.getElementById(id);
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        container.style.cssText = `
            display: block;
            margin-top: -40px;
            width: 100%;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            padding: 0 20px;
            position: relative;
            z-index: 5;
            ${styles}
        `;
        document.body.appendChild(container);
    }
    container.innerHTML = content;
    container.style.display = 'block';
    return container;
}

// UI state functions
function showLoadingState() {
    hideAllContainers();
    createContainer('loading-container', `
        <div class="state-card">
            <div class="loading-spinner">
                <div class="loading-spinner-inner"></div>
            </div>
            <div class="state-title">Loading Document Editor</div>
            <div id="loading-message" class="state-message">Connecting and authenticating...</div>
        </div>
    `);
}

function showTimeoutState() {
    hideAllContainers();
    createContainer('timeout-container', `
        <div class="state-card">
            <div class="timeout-icon">!</div>
            <div class="state-title">Couldn't Load Document</div>
            <div class="state-message">Make sure you're authenticated.</div>
        </div>
    `);
}

function showErrorState(errorMessage) {
    hideAllContainers();
    createContainer('error-container', `
        <div class="state-card">
            <div class="error-icon">✗</div>
            <div class="state-title">Authentication Error</div>
            <div class="state-message">${errorMessage}</div>
        </div>
    `);
}

function showAuthenticatedUI(user) {
    hideAllContainers();
    document.getElementById('superdoc-container').style.display = 'block';
    
    // Update user card details and show it
    updateUserCard(user);
    showUserCard();
}

function updateUserCard(user) {
    const userName = user.name || 'User';
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    // Update user name
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = userName;
    }
    
    // Update user email
    const userEmailEl = document.getElementById('user-email');
    if (userEmailEl) {
        userEmailEl.textContent = user.email;
    }
    
    // Update avatar
    const avatarImg = document.getElementById('user-avatar-img');
    const avatarInitials = document.getElementById('user-avatar-initials');
    
    if (user.picture && user.picture.trim() !== '') {
        // Show image avatar
        if (avatarImg) {
            avatarImg.src = user.picture;
            avatarImg.alt = 'User Avatar';
            avatarImg.style.display = 'block';
        }
        if (avatarInitials) {
            avatarInitials.style.display = 'none';
        }
    } else {
        // Show initials avatar
        if (avatarImg) {
            avatarImg.style.display = 'none';
        }
        if (avatarInitials) {
            avatarInitials.textContent = initials;
            avatarInitials.style.display = 'flex';
        }
    }
}

function showUserCard() {
    const userCard = document.getElementById('user-card');
    if (userCard) {
        userCard.classList.remove('user-card-hidden');
        userCard.classList.add('user-card-visible');
    }
}

function hideUserCard() {
    const userCard = document.getElementById('user-card');
    if (userCard) {
        userCard.classList.remove('user-card-visible');
        userCard.classList.add('user-card-hidden');
    }
}

// WebSocket message handlers
const messageHandlers = {
    client_ready: () => {
        // Another client is ready - nothing to do for browser
        logMessage('📡 Another client is ready');
    },
    
    token_transfer: async (message) => {
        // Clear the auth timeout since we received a response
        if (authTimeout) {
            clearTimeout(authTimeout);
            authTimeout = null;
        }
        
        if (message.error) {
            logMessage('❌ Token transfer failed:', message.error);
            updateStatusIndicator('disconnected');
            showErrorState('Authentication failed. Please try again from the Word add-in.');
            return;
        }
        
        if (message.token && message.user) {
            logMessage('✅ Token received and authenticated');
            isAuthenticated = true;
            authToken = message.token;
            updateStatusIndicator('connected');
            
            // Update SuperDoc baseConfig with user info
            baseConfig.user = {
                name: message.user.name || 'SuperDoc User',
                email: message.user.email || 'superdoc@example.com',
                image: message.user.picture || 'image-url.jpg'
            };
            
            showAuthenticatedUI(message.user);
            await loadDocumentFromServer();
        }
    },
    
    document_update: (message) => {
        if (!message.document || !isAuthenticated) return;
        
        try {
            logMessage('📡 Received document update from:', message.author);
            showSyncingStatus(); // Show syncing animation
            
            const documentBlob = base64ToBlob(message.document, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            const documentFile = new File([documentBlob], 'document.docx', { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            
            // Use the mode from the message if available, otherwise use current mode
            const documentMode = message.mode || currentDocumentMode;
            
            superdocInstance = new SuperDocLibrary.SuperDoc({
                ...baseConfig, 
                document: documentFile,
                documentMode: documentMode
            });
            
            // Update our tracked mode and dropdown
            currentDocumentMode = documentMode;
            updateModeDropdown(documentMode);
            
            logMessage('🔄 SuperDoc reinitialized with updated document');
        } catch (error) {
            console.error('❌ Error updating document:', error);
        }
    },
    
    close: () => {
        logMessage('📡 Another client disconnected');
        updateStatusIndicator('disconnected');
    },
    
    error: () => {
        logMessage('❌ Connection error occurred');
        updateStatusIndicator('error');
    },
    
    update_mode: async (message) => {
        logMessage('🎯 Mode update received from:', message.author);
        console.log(`📝 Document mode changed: ${message.previousMode} → ${message.mode} (from ${message.author})`);
        
        // Re-initialize SuperDoc with the new document mode
        const mode = message.mode;
        if (['editing', 'suggesting', 'viewing'].includes(mode)) {
            if (superdocInstance) {
                console.log(`📝 Re-initializing SuperDoc with mode: ${mode}`);
                
                // Save current document before re-initialization
                let currentDocument = null;
                try {
                    const docxBlob = await superdocInstance.activeEditor.exportDocx();
                    currentDocument = new File([docxBlob], 'document.docx', {
                        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    });
                    console.log('📄 Current document saved for re-initialization');
                } catch (error) {
                    console.log('⚠️ Could not export current document:', error.message);
                }
                
                // Re-create SuperDoc instance with new documentMode and preserved document
                const config = {
                    ...baseConfig,
                    documentMode: mode
                };
                
                if (currentDocument) {
                    config.document = currentDocument;
                }
                
                superdocInstance = new SuperDocLibrary.SuperDoc(config);
                console.log('🔄 SuperDoc re-initialized with new mode', superdocInstance);
                setTimeout(() => superdocInstance.toolbar.updateToolbarState(), 500);

                // Update our tracked mode and dropdown
                currentDocumentMode = mode;
                updateModeDropdown(mode);
                window.superdocInstance = superdocInstance;
                console.log(`✅ SuperDoc re-initialized with mode: ${mode}`);
            } else {
                console.log('⚠️ SuperDoc instance not available');
            }
        } else {
            console.log(`⚠️ Invalid mode received: ${mode}`);
        }
    }
};

// Document loading
async function loadDocumentFromServer() {
    logMessage('📄 Loading document from server...');
    
    if (!authToken) {
        console.error('❌ No auth token available');
        superdocInstance = new SuperDocLibrary.SuperDoc(baseConfig);
        return;
    }
    
    try {
        const response = await fetch('/document', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Document request failed:', response.status, errorText);
            showErrorState(`Failed to load document: ${response.status}`);
            return;
        }
        
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/vnd.openxmlformats-officedocument')) {
            const blob = await response.blob();
            const documentFile = new File([blob], 'document.docx', {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            
            superdocInstance = new SuperDocLibrary.SuperDoc({
                ...baseConfig, 
                document: documentFile
            });

                    window.superdocInstance = superdocInstance;
            
            logMessage('SuperDoc initialized with document');
        } else {
            superdocInstance = new SuperDocLibrary.SuperDoc(baseConfig);
            logMessage('SuperDoc initialized with empty document');
        }
    } catch (error) {
        console.error('Error loading document:', error);
        showErrorState(`Failed to load document: ${error.message}`);
    }
}

// WebSocket initialization
function initializeWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
        logMessage('🔌 WebSocket connection opened');
        updateStatusIndicator('connecting');
        showLoadingState();
        
        // Set timeout for token_transfer event
        authTimeout = setTimeout(() => {
            logMessage('❌ Authentication timeout - no token received');
            updateStatusIndicator('disconnected');
            showTimeoutState();
        }, 2000);
        
        // Send ready message to trigger authentication flow
        websocket.send(JSON.stringify({
            type: 'client_ready'
        }));
    };
    
    websocket.onmessage = async (event) => {
        try {
            const message = JSON.parse(event.data);
            logMessage('📨 WebSocket message received:', message.type);
            
            const handler = messageHandlers[message.type];
            if (handler) {
                await handler(message);
            } else {
                logMessage('📨 Unhandled message type:', message.type);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    };
    
    websocket.onclose = () => logMessage('🔌 WebSocket connection closed');
    websocket.onerror = (error) => console.error('❌ WebSocket error:', error);
    
    window.documentWebSocket = websocket;
}

// Update document mode dropdown
function updateModeDropdown(mode) {
    const modeIcon = document.getElementById('mode-icon');
    const modeLabel = document.getElementById('mode-label');
    const modeOptions = document.querySelectorAll('.mode-option');
    
    // Update icon and text using class toggles
    if (modeIcon && modeLabel) {
        // Remove all mode icon classes
        modeIcon.classList.remove('mode-icon-editing', 'mode-icon-suggesting', 'mode-icon-viewing');
        
        // Add the appropriate mode class and update text
        const modeConfig = {
            'editing': { class: 'mode-icon-editing', text: 'Editing' },
            'suggesting': { class: 'mode-icon-suggesting', text: 'Suggesting' },
            'viewing': { class: 'mode-icon-viewing', text: 'Viewing' }
        };
        
        const config = modeConfig[mode];
        if (config) {
            modeIcon.classList.add(config.class);
            modeLabel.textContent = config.text;
        } else {
            // Fallback for unknown modes
            modeLabel.textContent = mode;
        }
        
        // Update selected state in options
        modeOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.value === mode) {
                option.classList.add('selected');
            }
        });
        
        console.log(`📋 Dropdown updated to: ${mode}`);
    }
}

// Handle document mode dropdown changes
function setupModeDropdown() {
    const modeButton = document.getElementById('mode-button');
    const modeOptions = document.getElementById('mode-options');
    const modeOptionElements = document.querySelectorAll('.mode-option');
    
    if (modeButton && modeOptions) {
        // Set initial value
        updateModeDropdown(currentDocumentMode);
        
        // Toggle dropdown visibility
        modeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isVisible = modeOptions.style.display === 'block';
            modeOptions.style.display = isVisible ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            modeOptions.style.display = 'none';
        });
        
        // Handle option selection
        modeOptionElements.forEach(option => {
            option.addEventListener('click', async (event) => {
                event.stopPropagation();
                const newMode = option.dataset.value;
                console.log(`📋 User selected mode: ${newMode}`);
                
                // Hide dropdown
                modeOptions.style.display = 'none';
                
                if (newMode !== currentDocumentMode && superdocInstance) {
                    // Re-initialize SuperDoc with new mode (preserve document)
                    try {
                        // Save current document before re-initialization
                        let currentDocument = null;
                        try {
                            const docxBlob = await superdocInstance.activeEditor.exportDocx();
                            currentDocument = new File([docxBlob], 'document.docx', {
                                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            });
                            console.log('📄 Current document saved for mode change');
                        } catch (error) {
                            console.log('⚠️ Could not export current document:', error.message);
                        }
                        
                        // Re-create SuperDoc instance with new mode
                        const config = {
                            ...baseConfig,
                            documentMode: newMode
                        };
                        
                        if (currentDocument) {
                            config.document = currentDocument;
                        }
                        
                        const previousMode = currentDocumentMode;
                        
                        superdocInstance = new SuperDocLibrary.SuperDoc(config);
                        currentDocumentMode = newMode;
                        updateModeDropdown(newMode);
                        window.superdocInstance = superdocInstance;
                        
                        // Send mode update via WebSocket
                        if (window.documentWebSocket && window.documentWebSocket.readyState === WebSocket.OPEN && authToken) {
                            window.documentWebSocket.send(JSON.stringify({
                                type: 'update_mode',
                                token: authToken,
                                mode: newMode,
                                previousMode: previousMode
                            }));
                            console.log(`📤 Sent mode update via WebSocket: ${previousMode} → ${newMode}`);
                        }
                        
                        console.log(`✅ SuperDoc mode changed to: ${newMode}`);
                    } catch (error) {
                        console.error('❌ Error changing mode:', error);
                        // Revert dropdown to previous state
                        updateModeDropdown(currentDocumentMode);
                    }
                }
            });
        });
        
        console.log('📋 Document mode dropdown initialized');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupModeDropdown();
        initializeWebSocket();
    });
} else {
    setupModeDropdown();
    initializeWebSocket();
}