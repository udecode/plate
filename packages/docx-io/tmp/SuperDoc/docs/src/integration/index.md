---
{ 'home': False, 'prev': False, 'next': False }
---

# Integration

Learn how to integrate SuperDoc with various JavaScript frameworks and environments.

<p style="margin-bottom: 2rem;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    transition: color .4s ease-in-out;
    font-size: .8rem;">
SuperDoc is designed to work with any JavaScript environment. Whether you're using React, Vue, Angular, or vanilla JavaScript, SuperDoc provides a seamless integration experience.
</p>

## React Integration {#react}

SuperDoc can be easily integrated into React applications using a wrapper component.

### Basic Integration

```jsx
import React, { useEffect, useRef } from 'react';
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

function SuperDocComponent({ documentId, documentData, user }) {
  const containerRef = useRef(null);
  const superdocRef = useRef(null);

  useEffect(() => {
    // Initialize SuperDoc when the component mounts
    if (containerRef.current && !superdocRef.current) {
      superdocRef.current = new SuperDoc({
        selector: '#superdoc-container',
        documents: [
          {
            id: documentId,
            type: 'docx',
            data: documentData,
          },
        ],
        user: user,
      });
    }

    // Clean up SuperDoc when the component unmounts
    return () => {
      if (superdocRef.current) {
        // Clean up the SuperDoc instance
        superdocRef.current = null;
      }
    };
  }, [documentId, documentData, user]);

  return (
    <div
      id="superdoc-container"
      ref={containerRef}
      style={{ width: '100%', height: '700px' }}></div>
  );
}

export default SuperDocComponent;
```

### Usage in a React Application

```jsx
import React, { useState, useEffect } from 'react';
import SuperDocComponent from './SuperDocComponent';

function DocumentEditor() {
  const [documentData, setDocumentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch document data
    fetch('/api/documents/123')
      .then((response) => response.blob())
      .then((blob) => {
        setDocumentData(blob);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading document:', error);
        setIsLoading(false);
      });
  }, []);

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    image: 'https://example.com/avatar.jpg',
  };

  return (
    <div className="document-editor">
      <h1>Document Editor</h1>
      {isLoading ? (
        <p>Loading document...</p>
      ) : (
        <SuperDocComponent documentId="doc-123" documentData={documentData} user={user} />
      )}
    </div>
  );
}

export default DocumentEditor;
```

### Advanced React Integration

For more complex use cases, you might want to expose SuperDoc methods to your React component:

```jsx
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const SuperDocComponent = forwardRef(({ documentId, documentData, user, onReady }, ref) => {
  const containerRef = useRef(null);
  const superdocRef = useRef(null);

  // Expose SuperDoc methods to parent components
  useImperativeHandle(ref, () => ({
    exportDocx: () => superdocRef.current.exportDocx(),
    exportPdf: () => superdocRef.current.exportPdf(),
    setDocumentMode: (mode) => superdocRef.current.setDocumentMode(mode),
  }));

  useEffect(() => {
    if (containerRef.current && !superdocRef.current) {
      superdocRef.current = new SuperDoc({
        selector: '#superdoc-container',
        documents: [
          {
            id: documentId,
            type: 'docx',
            data: documentData,
          },
        ],
        user: user,
      });

      if (onReady) {
        superdocRef.current.on('ready', onReady);
      }
    }

    return () => {
      if (superdocRef.current) {
        if (onReady) {
          superdocRef.current.off('ready', onReady);
        }
        superdocRef.current = null;
      }
    };
  }, [documentId, documentData, user, onReady]);

  return (
    <div
      id="superdoc-container"
      ref={containerRef}
      style={{ width: '100%', height: '700px' }}></div>
  );
});

export default SuperDocComponent;
```

## Vue Integration {#vue}

SuperDoc can be integrated with Vue applications, both with Vue 2 and Vue 3.

### Vue 3 Integration

```vue
<template>
  <div ref="superdocContainer" class="superdoc-container"></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

export default {
  name: 'SuperDocEditor',
  props: {
    documentId: {
      type: String,
      required: true,
    },
    documentData: {
      type: Object,
      default: null,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  emits: ['ready', 'comments-update'],
  setup(props, { emit }) {
    const superdocContainer = ref(null);
    let superdoc = null;

    onMounted(() => {
      superdoc = new SuperDoc({
        selector: superdocContainer.value,
        documents: [
          {
            id: props.documentId,
            type: 'docx',
            data: props.documentData,
          },
        ],
        user: props.user,
      });

      // Set up event listeners
      superdoc.on('ready', () => {
        emit('ready', superdoc);
      });

      superdoc.on('commentsUpdate', (data) => {
        emit('comments-update', data);
      });
    });

    onBeforeUnmount(() => {
      if (superdoc) {
        // Clean up event listeners
        superdoc.off('ready');
        superdoc.off('commentsUpdate');
        superdoc = null;
      }
    });

    // Expose methods to parent component
    const exportDocx = () => superdoc?.exportDocx();
    const exportPdf = () => superdoc?.exportPdf();
    const setDocumentMode = (mode) => superdoc?.setDocumentMode(mode);

    return {
      superdocContainer,
      exportDocx,
      exportPdf,
      setDocumentMode,
    };
  },
};
</script>

<style scoped>
.superdoc-container {
  width: 100%;
  height: 700px;
}
</style>
```

### Vue 2 Integration

```vue
<template>
  <div ref="superdocContainer" class="superdoc-container"></div>
</template>

<script>
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

export default {
  name: 'SuperDocEditor',
  props: {
    documentId: {
      type: String,
      required: true,
    },
    documentData: {
      type: Object,
      default: null,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      superdoc: null,
    };
  },
  mounted() {
    this.superdoc = new SuperDoc({
      selector: this.$refs.superdocContainer,
      documents: [
        {
          id: this.documentId,
          type: 'docx',
          data: this.documentData,
        },
      ],
      user: this.user,
    });

    // Set up event listeners
    this.superdoc.on('ready', this.handleReady);
    this.superdoc.on('commentsUpdate', this.handleCommentsUpdate);
  },
  beforeDestroy() {
    if (this.superdoc) {
      // Clean up event listeners
      this.superdoc.off('ready', this.handleReady);
      this.superdoc.off('commentsUpdate', this.handleCommentsUpdate);
      this.superdoc = null;
    }
  },
  methods: {
    handleReady() {
      this.$emit('ready', this.superdoc);
    },
    handleCommentsUpdate(data) {
      this.$emit('comments-update', data);
    },
    exportDocx() {
      return this.superdoc?.exportDocx();
    },
    exportPdf() {
      return this.superdoc?.exportPdf();
    },
    setDocumentMode(mode) {
      this.superdoc?.setDocumentMode(mode);
    },
  },
};
</script>

<style scoped>
.superdoc-container {
  width: 100%;
  height: 700px;
}
</style>
```

## Vanilla JS Integration {#vanilla-js}

SuperDoc can be used with plain JavaScript without any framework.

### Basic HTML Setup

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SuperDoc Example</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/style.css" />
    <script
      src="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/superdoc.es.js"
      type="module"></script>
    <style>
      #superdoc-container {
        width: 100%;
        height: 700px;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <div id="superdoc-container"></div>

    <script type="module">
      import { SuperDoc } from 'https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/superdoc.es.js';

      // Initialize SuperDoc when the page loads
      document.addEventListener('DOMContentLoaded', () => {
        const superdoc = new SuperDoc({
          selector: '#superdoc-container',
          documents: [
            {
              id: 'example-doc',
              type: 'docx',
              // Use a file input to get the document data
              // data: document.getElementById('file-input').files[0]
            },
          ],
          user: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        });
      });
    </script>
  </body>
</html>
```

### Loading Files from Input

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SuperDoc File Upload Example</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/style.css" />
    <script
      src="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/superdoc.es.js"
      type="module"></script>
    <style>
      #superdoc-container {
        width: 100%;
        height: 700px;
        border: 1px solid #ccc;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div>
      <label for="file-input">Select a DOCX file:</label>
      <input type="file" id="file-input" accept=".docx" />
    </div>

    <div id="superdoc-container"></div>

    <script type="module">
      import { SuperDoc } from 'https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/superdoc.es.js';

      let superdoc = null;

      document.addEventListener('DOMContentLoaded', () => {
        const fileInput = document.getElementById('file-input');

        fileInput.addEventListener('change', (event) => {
          const file = event.target.files[0];
          if (!file) return;

          // Clean up previous instance if it exists
          if (superdoc) {
            superdoc = null;
          }

          // Initialize SuperDoc with the selected file
          superdoc = new SuperDoc({
            selector: '#superdoc-container',
            documents: [
              {
                id: 'uploaded-doc',
                type: 'docx',
                data: file,
              },
            ],
            user: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          });
        });
      });
    </script>
  </body>
</html>
```

## Setting Up Collaborative Editing

SuperDoc supports real-time collaborative editing using Yjs. Here's how to set it up:

### Client-Side Setup

```javascript
const superdoc = new SuperDoc({
  selector: '#superdoc-container',
  documents: [
    {
      id: 'collaborative-doc', // This ID is used as the collaboration room name
      type: 'docx',
    },
  ],
  modules: {
    collaboration: {
      url: 'wss://your-collaboration-server.com',
      token: 'user-auth-token',
      // Optional: WebSocket connection parameters
      params: {
        docId: 'collaborative-doc',
        userId: 'user-123',
      },
    },
  },
  user: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    image: 'https://example.com/jane.jpg', // Optional avatar URL
  },
});

// Listen for collaboration events
superdoc.on('awarenessUpdate', ({ users }) => {
  console.log('Currently active users:', users);
});
```

### Server Setup with Hocuspocus

SuperDoc works well with [Hocuspocus](https://tiptap.dev/hocuspocus) as a collaboration backend:

```javascript
// server.js
import { Server } from '@hocuspocus/server';
import { Logger } from '@hocuspocus/extension-logger';
import { Database } from '@hocuspocus/extension-database';

const server = Server.configure({
  port: 1234,
  extensions: [
    new Logger(),
    new Database({
      // Database configuration for document persistence
    }),
  ],
  onAuthenticate: async ({ token }) => {
    // Validate user token
    // Return user data or throw an error if validation fails
    return {
      user: {
        id: 'user-123',
        name: 'Jane Doe',
      },
    };
  },
});

server.listen();
```

## Next Steps

- See [Components](/components/) for detailed component reference
- Check out [Resources](/resources/) for examples, FAQ, and community resources
- Learn more about [Getting Started](/) for basic concepts and setup
