# SuperDoc Anywhere

A Chrome extension that automatically opens downloaded documents (DOCX, Markdown) in SuperDoc viewer with editing capabilities.

## Features

- **Automatic Document Opening**: Automatically opens downloaded DOCX and Markdown files in SuperDoc viewer
- **Document Editing**: Edit documents directly in the browser with SuperDoc's rich editing interface
- **Multiple Export Formats**: Export edited documents as DOCX, HTML, or Markdown
- **Context Menu Integration**: Right-click selected text on any webpage to open it in SuperDoc
- **Extension Toggle**: Enable/disable the extension via popup menu

## Installation

### For Users

1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension directory
5. The SuperDoc Anywhere extension should now appear in your extensions list

### Building from Source

See the [Development](#development) section below.

## Usage

### Automatic Document Opening

1. Download a DOCX or Markdown file from any website
2. The extension will automatically open the document in SuperDoc viewer
3. Edit the document using SuperDoc's rich editing interface
4. Export your changes using the download button

### Context Menu

1. Select text on any webpage
2. Right-click and choose "Open selected content in SuperDoc"
3. The selected content will open in SuperDoc for editing

### Extension Control

- Click the SuperDoc Anywhere icon in the toolbar to toggle the extension on/off
- When disabled, documents won't automatically open in SuperDoc

## Supported File Types

- **DOCX**: Microsoft Word documents with full editing support
- **Markdown**: `.md` and `.markdown` files with HTML preview and editing
- **Selected HTML**: Any selected text from webpages

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Chrome browser

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension (only needed for docx-validator):
   ```bash
   npm run build
   ```

### Development Workflow

1. Make changes to source files
2. Rebuild if necessary:
   ```bash
   npm run build
   ```
3. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the SuperDoc Anywhere extension

### Project Structure

```
superdoc-extension/
├── background.js           # Service worker for handling downloads
├── content.js             # Content script for modal and SuperDoc integration
├── docx-validator.js       # DOCX validation and correction utilities
├── manifest.json          # Extension manifest
├── popup.html/popup.js     # Extension popup interface
├── modal.html/modal.css    # Modal interface for document viewer
├── lib/                   # SuperDoc library files
│   ├── superdoc.umd.js
│   └── style.css
├── icons/                 # Extension icons
├── dist/                  # Built files
└── webpack.config.js      # Webpack configuration
```

### Key Components

- **background.js**: Handles download events, file processing, and message routing
- **content.js**: Manages the SuperDoc modal interface and document rendering
- **docx-validator.js**: Validates and corrects DOCX file structure for better compatibility
- **popup.js**: Controls the extension enable/disable functionality

### Testing

1. Load test documents from the `test_docs/` directory
2. Test different file types and edge cases
3. Verify context menu functionality
4. Test extension enable/disable functionality