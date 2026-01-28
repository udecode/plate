let viewerDownloadIds = new Set();
let extensionEnabled = true;

// Import the bundled docx validator
importScripts('dist/docx-validator.bundle.js');

// Update extension icon based on enabled state
function updateIcon(enabled) {
  const suffix = enabled ? '' : '-disabled';
  const iconPath = {
    "16": `icons/icon-16x16${suffix}.png`,
    "19": `icons/icon-19x19${suffix}.png`,
    "48": `icons/icon-48x48${suffix}.png`,
    "128": `icons/icon-128x128${suffix}.png`
  };
  
  chrome.action.setIcon({ path: iconPath });
}

// Load extension state from storage and set initial icon
chrome.storage.sync.get(['extensionEnabled'], (result) => {
  extensionEnabled = result.extensionEnabled !== false; // Default to enabled
  updateIcon(extensionEnabled);
});

// Create context menu on installation for selecting text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openSelectedInSuperdoc",
    title: "Open selected content in SuperDoc",
    contexts: ["selection"]
  });
});

// enable/disable extension via extension popup
async function handleToggleExtension(request, sender, sendResponse) {
  extensionEnabled = request.enabled;
  updateIcon(extensionEnabled);
  console.log('Extension toggled:', extensionEnabled ? 'enabled' : 'disabled');
  sendResponse({ success: true });
}

/**
 * Handles file download requests from the extension
 * @param {Object} request - The download request object
 * @param {string} request.url - The URL of the file to download
 * @param {string} request.filename - The desired filename for the downloaded file
 * @param {Object} sender - The sender information from Chrome runtime
 * @param {Function} sendResponse - Callback function to send response back to sender
 * @returns {boolean} Returns true to keep message channel open for async response
 */
async function handleDownloadFile(request, _sender, sendResponse) {
  try {
    // Download file using Chrome downloads API
    const downloadId = await chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: true
    });

    // Track this download to ignore it if downloaded from viewer
    viewerDownloadIds.add(downloadId);
    console.log('File download initiated:', request.filename, 'ID:', downloadId);
    
    sendResponse({ success: true, downloadId: downloadId });
  } catch (error) {
    console.error('Error downloading file:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // Keep message channel open for async response
}

// Action to handler mapping
const messageHandlers = {
  'toggleExtension': handleToggleExtension,
  'downloadFile': handleDownloadFile,
};

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handler = messageHandlers[request.action];
  if (!handler) return false;

  handler(request, sender, sendResponse);
  return true;
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!(info.menuItemId === "openSelectedInSuperdoc" && info.selectionText)) return;

  // Send message to content script to capture HTML and open in SuperDoc
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'captureSelectedHTML',
      selectedText: info.selectionText
    });
  } catch (error) {
    console.error('Error sending message to content script:', error);
  }
});

// chrome download event listener (on download completion, so writes to disk first)
chrome.downloads.onChanged.addListener(async (downloadDelta) => {
  if (downloadDelta.state?.current !== 'complete') return;

  // Check if extension is disabled
  if (!extensionEnabled) {
    console.log('Extension disabled, ignoring download');
    return;
  }
  
  // Check if this is a download from viewer - if so, ignore it, otherwise we get endless loop of opening modals
  if (viewerDownloadIds.has(downloadDelta.id)) {
    viewerDownloadIds.delete(downloadDelta.id);
    console.log('Ignoring viewer download completion:', downloadDelta.id);
    return;
  }
  
  try {
    await processDownload(downloadDelta.id);
  } catch (error) {
    console.error('Error processing download:', error);
  }
});

async function sendMessageToActiveTab(action, payload) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length) return;

    await chrome.tabs.sendMessage(tabs[0].id, {
      action,
      ...payload
    });
  } catch (error) {
    console.error('Error sending message to content script:', error);
  }
}

async function processDownload(downloadId) {
  const downloads = await chrome.downloads.search({ id: downloadId });
  if (!downloads.length) return;

  const download = downloads[0];
  const filename = download.filename.toLowerCase();
  
  // File type handlers
  // We will handle markdown like html, since they are interoperable (to a point)
  const fileHandlers = {
    '.docx': processDocxFile,
    '.md': processMarkdownFile,
    '.markdown': processMarkdownFile
  };

  const extension = filename.substring(filename.lastIndexOf('.'));
  const handler = fileHandlers[extension];
  if (!handler) throw new Error(`No handler for file type: ${extension}`);
  
  await handler(download);
}

// docx file processing
async function processDocxFile(download) {
  // fetch and stringify (actual blob was getting dropped on message to viewer.js)
  const response = await fetch(`file://${download.filename}`); // background scripts let us do cool stuff like this
  const blob = await response.blob();
  
  // Validate and correct the DOCX file
  // Some DOCX files are generate with little to no style info or a poor schema,
  // here we try to fill in the blanks.
  let correctedBlob = blob;
  try {
    console.log('Validating and correcting DOCX file...');
    correctedBlob = await DocxValidator.validateAndCorrectDocx(blob);
    console.log('DOCX validation and correction completed');
  } catch (error) {
    console.error('Error validating DOCX:', error);
    // Continue with original blob if validation fails
  }
  
  // convert to b64, actual blobs were getting dropped on message to content script
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(correctedBlob);
  });
  
  // Send message to content script to display modal
  await sendMessageToActiveTab('displayDOCX', {
    data: {
      filename: download.filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: correctedBlob.size,
      base64Data
    }
  });
}

async function processMarkdownFile(download) {
  // Fetch the markdown file content
  const response = await fetch(`file://${download.filename}`);
  const markdownText = await response.text();
  
  // Convert markdown to HTML
  const htmlContent = markdownToHtml(markdownText);
  
  // Send message to content script with HTML content
  await sendMessageToActiveTab('displayMarkdown', {
    data: {
      filename: download.filename,
      htmlContent: htmlContent,
      originalMarkdown: markdownText
    }
  });
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.+?)_/gim, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  
  // Inline code
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>');
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img alt="$1" src="$2" />');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\+ (.*$)/gim, '<li>$1</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  
  // Line breaks
  html = html.replace(/\n\n/gim, '</p><p>');
  html = html.replace(/\n/gim, '<br>');
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/gim, '');
  html = html.replace(/<p>(<h[1-6]>)/gim, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<ul>)/gim, '$1');
  html = html.replace(/(<\/ul>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<pre>)/gim, '$1');
  html = html.replace(/(<\/pre>)<\/p>/gim, '$1');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  return html;
}