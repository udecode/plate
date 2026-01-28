let superdoc = null;
let currentFileData = null;
let modalContainer = null;

const ID_PREFIX = 'superdoc-anywhere-extension__';

// Load modal HTML from file
async function loadModalHTML() {
  try {
    const response = await fetch(chrome.runtime.getURL('modal.html'));
    if (!response.ok) {
      throw new Error(`Failed to load modal HTML: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading modal HTML:', error);
    return null;
  }
}

// Inject CSS for modal
function injectModalCSS() {
  if (document.getElementById(`${ID_PREFIX}modal-css`)) return;
  
  const style = document.createElement('style');
  style.id = `${ID_PREFIX}modal-css`;
  style.textContent = `
    #${ID_PREFIX}modal * {
      box-sizing: border-box;
    }
    
    #${ID_PREFIX}download-btn:hover {
      background: #0056b3 !important;
    }
    
    #${ID_PREFIX}close-btn:hover {
      background: #545b62 !important;
    }
  `;
  document.head.appendChild(style);
}

// Load SuperDoc library (should already be loaded via content script)
async function loadSuperDoc() {
  // Load CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = chrome.runtime.getURL('lib/style.css');
  document.head.appendChild(cssLink);
  
  // Check if SuperDoc library is available
  if (!window.SuperDocLibrary) {
    throw new Error('SuperDocLibrary not found - should be loaded via content script');
  }
}

// Create modal
async function createModal() {
  if (modalContainer) return modalContainer;
  
  injectModalCSS();
  
  // Load external modal CSS
  const modalCssLink = document.createElement('link');
  modalCssLink.rel = 'stylesheet';
  modalCssLink.href = chrome.runtime.getURL('modal.css');
  document.head.appendChild(modalCssLink);
  
  // Load modal HTML from file
  const modalHTML = await loadModalHTML();
  if (!modalHTML) {
    console.error('Failed to load modal HTML');
    return null;
  }
  
  const div = document.createElement('div');
  div.innerHTML = modalHTML;
  modalContainer = div.firstElementChild;
  
  // Set the logo source after loading the HTML
  const logoImg = modalContainer.querySelector(`#${ID_PREFIX}logo`);
  if (logoImg) {
    // Try to get the page's favicon from gstatic first
    const currentDomain = window.location.hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${currentDomain}&sz=32`;
    
    logoImg.src = faviconUrl;
    
    // Fallback to extension logo if favicon fails to load
    logoImg.onerror = () => {
      logoImg.src = chrome.runtime.getURL('icons/logo.webp');
    };
  }
  
  // Set the document title
  const titleElement = modalContainer.querySelector(`#${ID_PREFIX}document-title`);
  if (titleElement && currentFileData) {
    const filename = currentFileData.filename.split('/').pop(); // Get just the filename
    const title = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
    titleElement.textContent = title || "Untitled Document";
  }
  
  document.body.appendChild(modalContainer);
  
  // Setup event listeners
  const closeBtn = modalContainer.querySelector(`#${ID_PREFIX}close-btn`);
  const downloadBtn = modalContainer.querySelector(`#${ID_PREFIX}download-btn`);
  const downloadDropdown = modalContainer.querySelector(`#${ID_PREFIX}download-dropdown`);
  const downloadMarkdownBtn = modalContainer.querySelector(`#${ID_PREFIX}download-markdown`);
  const downloadHtmlBtn = modalContainer.querySelector(`#${ID_PREFIX}download-html`);
  
  closeBtn.addEventListener('click', closeModal);
  downloadBtn.addEventListener('click', handleDownloadClick);
  downloadMarkdownBtn.addEventListener('click', () => exportMarkdown());
  downloadHtmlBtn.addEventListener('click', () => exportHTML());
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest(`#${ID_PREFIX}download-wrapper`)) {
      downloadDropdown.style.display = 'none';
    }
  });

  // Close on background click
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalContainer.style.display !== 'none') {
      closeModal();
    }
  });
  
  return modalContainer;
}

// Close modal
function closeModal() {
  if (!modalContainer) return;
  
  superdoc = null;

  // Remove modal from DOM completely
  modalContainer.remove();
  modalContainer = null;
  currentFileData = null;
}

// Show modal
function showModal() {
  if (!modalContainer) return;
  
  modalContainer.style.display = 'flex';
}


// Initialize SuperDoc in modal
async function initSuperdocWithDOCX(data) {
  console.log('Initializing SuperDoc in modal');
  
  try {
    if (!window.SuperDocLibrary?.SuperDoc) {
      console.error('SuperDocLibrary not available');
      showFallback(data);
      return;
    }
    
    const file = new File([data.blob], data.filename, { type: data.mimeType });
    const fileUrl = URL.createObjectURL(file);
    const superdocFile = await SuperDocLibrary.getFileObject(fileUrl, data.filename, data.mimeType);
    
    const config = {
      selector: `#${ID_PREFIX}docx-viewer`,
      toolbar: `#${ID_PREFIX}toolbar`,
      documentMode: 'editing',
      pagination: true,
      rulers: true,
      document: superdocFile,
      onReady: () => console.log('SuperDoc ready in modal'),
      onEditorCreate: () => console.log('Editor created in modal')
    };
    
    superdoc = new SuperDocLibrary.SuperDoc(config);
    // unhide selector
    const viewerElement = modalContainer.querySelector(`#${ID_PREFIX}docx-viewer`);
    if (viewerElement) {
      viewerElement.style.display = 'flex';
    }
    console.log('SuperDoc initialized in modal');
    
  } catch (error) {
    console.error('Error:', error.message);
    showFallback(data);
  }
}

// Handle download button click - shows dropdown for markdown files, downloads directly for others
async function handleDownloadClick() {
  const markdownViewer = document.getElementById(`${ID_PREFIX}markdown-viewer`);
  const docxViewer = document.getElementById(`${ID_PREFIX}docx-viewer`);
  const downloadDropdown = document.getElementById(`${ID_PREFIX}download-dropdown`);
  
  // Check if this is a markdown file
  if (markdownViewer && markdownViewer.style.display !== 'none') {
    // Show dropdown for markdown files
    const isVisible = downloadDropdown.style.display === 'block';
    downloadDropdown.style.display = isVisible ? 'none' : 'block';
  } else {
    // Download directly for other files
    await downloadCurrentFile();
  }
}

// Download current file
async function downloadCurrentFile() {
  if (!currentFileData) {
    console.error('No file data available for download');
    return;
  }

  try {
    // Check if this is a markdown file by looking at the viewer element
    const markdownViewer = document.getElementById(`${ID_PREFIX}markdown-viewer`);
    if (markdownViewer && markdownViewer.style.display !== 'none') {
      // This is a markdown file - use exportMarkdown
      await exportMarkdown();
      return;
    }
    
    // Export the current document from SuperDoc editor (DOCX files)
    const blobToDownload = await superdoc.activeEditor.exportDocx();

    // Convert blob to data URL for Chrome downloads API with correct MIME type
    const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const docxBlob = new Blob([blobToDownload], { type: docxMimeType });
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(docxBlob);
    });

    let fileName = currentFileData.filename;
    if (fileName.includes('/') || fileName.includes('\\')) {
      fileName = fileName.split('/').pop().split('\\').pop();
    }
    
    // Send download request to background script
    const response = await chrome.runtime.sendMessage({
      action: 'downloadFile',
      url: dataUrl,
      filename: fileName
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Download failed');
    }

    console.log('File download initiated:', fileName, 'ID:', response.downloadId);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

// Show fallback content
function showFallback(data) {
  const container = modalContainer.querySelector(`#${ID_PREFIX}viewer`);
  const bytes = data.fileSize;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = bytes === 0 ? '0 B' : Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  
  container.innerHTML = `
    <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
      <h2 style="margin: 0 0 10px 0;">File: ${data.filename}</h2>
      <p style="margin: 0 0 10px 0;">Size: ${formattedSize}</p>
      <p style="margin: 0;">SuperDoc unavailable - cannot display document.</p>
    </div>
  `;
}

// Initialize SuperDoc with HTML content for markdown files
async function initSuperdocWithHTML(data) {
  console.log('Initializing SuperDoc with HTML content');
  
  try {
    if (!window.SuperDocLibrary?.SuperDoc) {
      console.error('SuperDocLibrary not available');
      showMarkdownFallback(data);
      return;
    }
    
    // Create a simple HTML document structure
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.filename}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 40px; line-height: 1.6; }
          h1, h2, h3 { color: #333; }
          code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
          blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        ${data.htmlContent}
      </body>
      </html>
    `;
    
    
    const config = {
      selector: `#${ID_PREFIX}markdown-viewer`,
      documentMode: 'editing',
      pagination: true,
      rulers: true,
      mode: 'html',
      content: htmlContent,
      onReady: () => console.log('SuperDoc ready with HTML content'),
      onEditorCreate: () => console.log('Editor created with HTML content'),
      converter: SuperDocLibrary.SuperConverter
    };
    
    superdoc = new SuperDocLibrary.Editor(config);
    superdoc.converter = new SuperDocLibrary.SuperConverter();
    // unhide selector
    const viewerElement = modalContainer.querySelector(`#${ID_PREFIX}markdown-viewer`);
    if (viewerElement) {
      viewerElement.style.display = 'flex';
    }
    console.log('SuperDoc initialized with HTML content');

    const toolbar = new SuperDocLibrary.SuperToolbar({ element: `${ID_PREFIX}toolbar`, editor: superdoc, isDev: true, pagination: true, });
    
  } catch (error) {
    console.error('Error initializing SuperDoc with HTML:', error.message);
    showMarkdownFallback(data);
  }
}

// Show fallback content for markdown files
function showMarkdownFallback(data) {
  const container = modalContainer.querySelector(`#${ID_PREFIX}viewer`);
  
  container.innerHTML = `
    <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif; max-height: 500px; overflow-y: auto;">
      <h2 style="margin: 0 0 20px 0; color: #333;">Markdown File: ${data.filename}</h2>
      <div style="border: 1px solid #ddd; border-radius: 5px; padding: 20px; background: #f9f9f9;">
        ${data.htmlContent}
      </div>
      <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">SuperDoc unavailable - showing converted HTML content.</p>
    </div>
  `;
}

// Handle selected HTML capture
async function handleCaptureSelectedHTML(request, sendResponse) {
  console.log('Capturing selected HTML for SuperDoc');
  
  // Get the current selection
  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    console.error('No selection found');
    alert('No selection found.');
    sendResponse({ success: false, error: 'No selection found' });
    return;
  }

  try {
    // Get the range of the selection
    const range = selection.getRangeAt(0);
    
    // Extract the HTML content of the selection
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(range.cloneContents());
    const htmlContent = tempDiv.innerHTML;
    
    // Create data object similar to markdown processing
    const currentDomain = window.location.hostname;
    const data = {
      filename: `Selected content from ${currentDomain}.html`,
      htmlContent: htmlContent,
      originalSource: 'webpage_selection'
    };

    // Store as current file data
    currentFileData = data;

    // Load SuperDoc library
    await loadSuperDoc();
    
    // Create and show modal
    await createModal();
    showModal();
    
    // Initialize SuperDoc with HTML content
    await initSuperdocWithHTML(data);

    // respond to background script
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error capturing HTML:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true;
}

/**
 * Handles displaying DOCX files in the SuperDoc viewer
 * @param {Object} request - The request object
 * @param {Object} request.data - The file data
 * @param {string} request.data.base64Data - Base64 encoded DOCX file data
 * @param {string} request.data.filename - The filename of the DOCX file
 * @param {string} request.data.mimeType - MIME type of the file
 * @param {number} request.data.fileSize - Size of the file in bytes
 * @param {Function} sendResponse - Callback function to send response
 * @returns {boolean} Returns true to keep message channel open
 */
async function handledisplayDOCX(request, sendResponse) {
  if (!request.data.base64Data) return false;
  
  console.log('Received DOCX file data from background, displaying in modal');
  
  const bytes = atob(request.data.base64Data);
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }
  const blob = new Blob([array], { type: request.data.mimeType });
  const data = { ...request.data, blob };
  currentFileData = data;
  
  // Load SuperDoc library
  await loadSuperDoc();

  // Create and show modal
  await createModal();
  showModal();
  
  // Initialize SuperDoc
  await initSuperdocWithDOCX(data);
  
  sendResponse({ success: true });
  return true;
}

/**
 * Handles displaying markdown files in the SuperDoc viewer
 * @param {Object} request - The request object
 * @param {Object} request.data - The file data
 * @param {string} request.data.htmlContent - HTML content converted from markdown
 * @param {string} request.data.filename - The filename of the markdown file
 * @param {string} [request.data.originalSource] - Original source of the content
 * @param {Function} sendResponse - Callback function to send response
 * @returns {boolean} Returns true to keep message channel open
 */
async function handleDisplayMarkdown(request, sendResponse) {
  if (!request.data.htmlContent) return false;
  
  console.log('Received markdown file data from background, displaying in modal');
  
  currentFileData = request.data;
  
  // Load SuperDoc library
  await loadSuperDoc();

  // Create and show modal
  await createModal();
  showModal();
  
  // Initialize SuperDoc with HTML content
  await initSuperdocWithHTML(request.data);
  
  sendResponse({ success: true });
  return true;
}

// Action to handler mapping
const messageHandlers = {
  'captureSelectedHTML': handleCaptureSelectedHTML,
  'displayDOCX': handledisplayDOCX,
  'displayMarkdown': handleDisplayMarkdown
};

// Export markdown from SuperDoc editor
async function exportMarkdown() {
  const viewerElement = document.getElementById(`${ID_PREFIX}markdown-viewer`);
  if (!viewerElement) {
    console.error('Markdown viewer element not found');
    return;
  }
  
  const htmlContent = viewerElement.innerHTML;
  if (!htmlContent) {
    console.error('No HTML content found in markdown viewer');
    return;
  }
  
  // Convert HTML to markdown
  const markdownContent = htmlToMarkdown(htmlContent);
  
  // Create and download markdown file
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  // Generate filename
  const filename = currentFileData?.filename || 'document';
  const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  const cleanBaseName = baseName.split('/').pop().split('\\').pop(); // Remove path
  const markdownFilename = `${cleanBaseName}.md`;
  
  // Download using Chrome downloads API
  try {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    
    const response = await chrome.runtime.sendMessage({
      action: 'downloadFile',
      url: dataUrl,
      filename: markdownFilename
    });

    if (response?.success) {
      console.log('Markdown file downloaded:', markdownFilename);
      // Hide dropdown after successful download
      const downloadDropdown = document.getElementById(`${ID_PREFIX}download-dropdown`);
      downloadDropdown.style.display = 'none';
    } else {
      throw new Error(response?.error || 'Download failed');
    }
  } catch (error) {
    console.error('Error downloading markdown:', error);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Convert HTML to markdown
function htmlToMarkdown(html) {
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Convert headings
  html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  html = html.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  html = html.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  html = html.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
  
  // Convert paragraphs
  html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // Convert line breaks
  html = html.replace(/<br\s*\/?>/gi, '\n');
  
  // Convert bold and italic
  html = html.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  html = html.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  html = html.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  html = html.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Convert code
  html = html.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  html = html.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n\n');
  
  // Convert blockquotes
  html = html.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (_, content) => {
    return content.split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
  });
  
  // Convert lists
  html = html.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    return items.map(item => {
      const text = item.replace(/<\/?li[^>]*>/gi, '').trim();
      return `- ${text}`;
    }).join('\n') + '\n\n';
  });
  
  html = html.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (_, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    return items.map((item, index) => {
      const text = item.replace(/<\/?li[^>]*>/gi, '').trim();
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n\n';
  });
  
  // Remove remaining HTML tags
  html = html.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n'); // Multiple newlines to double
  html = html.replace(/^\s+|\s+$/g, ''); // Trim
  
  return html;
}

// Export HTML from SuperDoc editor
async function exportHTML() {
  const viewerElement = document.getElementById(`${ID_PREFIX}markdown-viewer`);
  if (!viewerElement) {
    console.error('Markdown viewer element not found');
    return;
  }
  
  let htmlContent = viewerElement.innerHTML;
  if (!htmlContent) {
    console.error('No HTML content found in markdown viewer');
    return;
  }
  
  // Create a complete HTML document
  const completeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentFileData?.filename || 'Document'}</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      margin: 40px; 
      line-height: 1.6; 
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 { color: #2c3e50; }
    code { 
      background: #f4f4f4; 
      padding: 2px 4px; 
      border-radius: 3px; 
      font-family: 'Courier New', monospace;
    }
    pre { 
      background: #f4f4f4; 
      padding: 15px; 
      border-radius: 5px; 
      overflow-x: auto; 
      border-left: 4px solid #3498db;
    }
    blockquote { 
      border-left: 4px solid #ddd; 
      margin: 0; 
      padding-left: 20px; 
      color: #666;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 20px 0;
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 8px; 
      text-align: left;
    }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  
  // Create and download HTML file
  const blob = new Blob([completeHTML], { type: 'text/html' });
  
  // Generate filename
  const filename = currentFileData?.filename || 'document';
  const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  const cleanBaseName = baseName.split('/').pop().split('\\').pop(); // Remove path
  const htmlFilename = `${cleanBaseName}.html`;
  
  // Download using Chrome downloads API
  try {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    
    const response = await chrome.runtime.sendMessage({
      action: 'downloadFile',
      url: dataUrl,
      filename: htmlFilename
    });
    
    if (response?.success) {
      console.log('HTML file downloaded:', htmlFilename);
      // Hide dropdown after successful download
      const downloadDropdown = document.getElementById(`${ID_PREFIX}download-dropdown`);
      downloadDropdown.style.display = 'none';
    } else {
      throw new Error(response?.error || 'Download failed');
    }
  } catch (error) {
    console.error('Error downloading HTML:', error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
  const handler = messageHandlers[request.action];
  if (handler) {
    return await handler(request, sendResponse);
  }
});