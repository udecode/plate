---
{ 'home': True, 'prev': False, 'next': False }
---

[![npm version](https://img.shields.io/npm/v/@harbour-enterprises/superdoc.svg?color=1355ff)](https://www.npmjs.com/package/@harbour-enterprises/superdoc)

# Quick Start

Learn how to install and set up SuperDoc, the modern collaborative document editor for the web.

<p style="margin-bottom: 2rem;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    transition: color .4s ease-in-out;
    font-size: .8rem;">
SuperDoc is a powerful document editor that brings Microsoft Word-level capabilities to your web applications. With real-time collaboration, extensive formatting options, and seamless integration capabilities, SuperDoc makes document editing on the web better for everyone.
</p>

## Introduction

SuperDoc is an open source document editor bringing Microsoft Word capabilities to the web with real-time collaboration, extensive formatting options, and easy integration.

### Key Features

- **Document Compatibility**: View and edit DOCX and PDF (view only) documents directly in the browser
- **Microsoft Word Integration**: Full support for importing/exporting, advanced formatting, comments, and tracked changes
- **Real-time Collaboration**: Built-in multiplayer editing, live updates, commenting, sharing, and revision history
- **Framework Agnostic**: Seamlessly integrates with Vue, React, or vanilla JavaScript
- **Extensible Architecture**: Modular design makes it easy to extend and customize
- **Dual License**: Available under AGPLv3 for community use and Commercial license for enterprise deployments

## Installation

### Package Installation

```bash
npm install @harbour-enterprises/superdoc
```

### CDN Usage

You can also use SuperDoc directly from a CDN:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/style.css" />
<script
  src="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/superdoc.es.js"
  type="module"></script>
```

## Basic Usage

```javascript
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const superdoc = new SuperDoc({
  selector: '#root',
  documents: [
    id: 'pets-123',
    type: 'docx',
    url: 'http://my-document-url.docx',
  ],
  pagination: true,
  licenseKey: 'community-and-eval-agplv3',
  telemetry: {
    enabled: true,
  } //basic usage metrics and exceptions
})
```

## Configuration Options {#configuration}

```javascript
const config = {
  // Optional: Give the superdoc an id
  superdocId: 'my-superdoc-id',

  // Optional: SuperDoc title
  title: 'My SuperDoc',

  // Required: A DOM element ID to render superdoc into
  selector: '#superdoc',

  // Optional: Initial document mode: viewing, suggesting,editing. Defaults to editing
  documentMode: 'editing',

  // Optional: User role: editor, suggester, viewer. Defaults to editor
  role: 'editor',

  // Required: Documents list with one document
  documents: [
    {
      id: 'my-doc-id', // Required: This document's ID. This is also used as the room name in collaboration.
      type: 'docx', // Required: 'pdf', 'docx' or 'html'

      // Document content - provide EITHER data OR url:
      data: fileObject, // Option 1: A JS File/Blob object of your document
      url: 'https://example.com/document.docx', // Option 2: URL to fetch the document from
    },
  ],

  // Optional: For enterprise users, set the license key
  licenseKey: 'community-and-eval-agplv3',

  // Optional: Enable telemetry to help us improve SuperDoc
  telemetry: {
    enabled: true,
  },

  // Optional: The current user
  user: {
    name: 'Superdoc User',
    email: 'superdoc@example.com',
    image: 'image-url.jpg',
  },

  // Optional: A DOM element ID to render the toolbar into
  toolbar: 'superdoc-toolbar',

  // Optional: modules
  modules: {
    // The collaboration module
    collaboration: {
      url: 'wss://your-collaboration-server.com', // Required: Path to your collaboration backend
      token: 'your-auth-token', // Required: Your auth token
    },

    // Toolbar config, overrides the 'toolbar' key, if provided, above
    toolbar: {
      selector: 'superdoc-toolbar',
    },

    // More coming soon
  },

  // Optional: events - pass in your own functions for each
  onEditorBeforeCreate: () => null,
  onEditorCreate: () => null,
  onEditorDestroy: () => null,
  onContentError: () => null,
  onReady: () => null,
  onPdfDocumentReady: () => null,
  onException: () => null,
};
```

## Document Modes and Roles

SuperDoc supports different document modes and user roles to control editing capabilities:

### Document Modes

- **editing** - Full document editing capabilities
- **viewing** - Read-only mode with no editing allowed
- **suggesting** - Track changes mode where edits are shown as suggestions

### User Roles

- **editor** - Users with full editing capabilities who can access all document modes
- **suggester** - Users who can only make suggestions (track changes) but cannot directly edit
- **viewer** - Users with read-only access who can only view the document

The user's role restricts which document modes they can access. For example, a user with the "viewer" role will always be in viewing mode regardless of the requested document mode.

## Project Structure

SuperDoc consists of two main packages:

```
/packages/super-editor  // Core editor component
/packages/superdoc      // Main SuperDoc package
```

### SuperDoc Package

This is the main package (published to npm). It includes SuperEditor and provides the complete document editing experience.

```bash
cd packages/superdoc
npm install && npm run dev
```

This will run **SuperdocDev.vue**, with a Vue 3 based example of how to instantiate SuperDoc.

### SuperEditor Package

This is the core DOCX editor and renderer (including the toolbar). It is included inside SuperDoc but can be used independently for advanced use cases.

```bash
cd packages/super-editor
npm install && npm run dev
```

## Event Handling

SuperDoc provides a robust event system to handle various document interactions:

```javascript
const superdoc = new SuperDoc({
  selector: '#superdoc',
  documents: [
    /* ... */
  ],
});

// Remove event listeners
superdoc.off('ready', myReadyHandler);
```

## Document Operations

```javascript
// Export the document as DOCX
await superdoc.export();

// Switch between viewing, suggesting, and editing modes
superdoc.setDocumentMode('viewing');
superdoc.setDocumentMode('suggesting');
superdoc.setDocumentMode('editing');

// Get a list of HTML strings (one per DOCX editor)
superdoc.getHTML();
```

## Next Steps

- See [Integration](/integration/) for framework-specific integration guides
- Explore [Components](/components/) for detailed component reference
- Check out [Resources](/resources/) for examples, FAQ, and community resources
