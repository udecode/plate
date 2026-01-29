---
{ 'home': False, 'prev': False, 'next': False }
---

# Resources

Examples, guides, and community resources for SuperDoc.

<p style="margin-bottom: 2rem;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    transition: color .4s ease-in-out;
    font-size: .8rem;">
This section contains practical examples, commonly asked questions, migration guides, and links to community resources that will help you get the most out of SuperDoc.
</p>

## Examples

### Loading a Document from URL

This example shows how to fetch a document from a URL and load it into SuperDoc.

```javascript
// Fetch document from URL
fetch('https://example.com/path/to/document.docx')
  .then((response) => response.blob())
  .then((blob) => {
    // Create a File object from the blob
    const file = new File([blob], 'document.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Initialize SuperDoc with the file
    const superdoc = new SuperDoc({
      selector: '#superdoc-container',
      documents: [
        {
          id: 'doc-from-url',
          type: 'docx',
          data: file,
        },
      ],
    });
  })
  .catch((error) => console.error('Error loading document:', error));
```

### Implementing Export Functionality

This example shows how to implement export buttons for DOCX and PDF formats.

```javascript
// HTML setup
// <button id="export-docx">Export DOCX</button>
// <button id="export-pdf">Export PDF</button>
// <div id="superdoc-container"></div>

// Initialize SuperDoc
const superdoc = new SuperDoc({
  selector: '#superdoc-container',
  documents: [
    /* ... */
  ],
});

// Add export functionality
document.getElementById('export-docx').addEventListener('click', async () => {
  try {
    const blob = await superdoc.exportDocx();
    downloadBlob(blob, 'document.docx');
  } catch (error) {
    console.error('Error exporting DOCX:', error);
  }
});

document.getElementById('export-pdf').addEventListener('click', async () => {
  try {
    const blob = await superdoc.exportPdf();
    downloadBlob(blob, 'document.pdf');
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
});

// Helper function to download a blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### Custom Comments UI

This example shows how to implement a custom comments sidebar that synchronizes with SuperDoc.

```javascript
// Initialize SuperDoc
const superdoc = new SuperDoc({
  selector: '#superdoc-container',
  documents: [
    /* ... */
  ],
  modules: {
    comments: {
      // Enable comments module
    },
  },
});

// Custom comments sidebar
const commentsList = document.getElementById('comments-list');
const addCommentButton = document.getElementById('add-comment');

// Listen for comments updates
superdoc.on('commentsUpdate', ({ comments }) => {
  // Clear existing comments
  commentsList.innerHTML = '';

  // Add each comment to the sidebar
  comments.forEach((comment) => {
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    commentEl.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${comment.user.name}</span>
        <span class="comment-date">${formatDate(comment.createdAt)}</span>
      </div>
      <div class="comment-content">${comment.content}</div>
    `;

    // Add click handler to highlight the comment in the document
    commentEl.addEventListener('click', () => {
      superdoc.highlightComment(comment.id);
    });

    commentsList.appendChild(commentEl);
  });
});

// Add a new comment
addCommentButton.addEventListener('click', () => {
  // This will trigger the SuperDoc comment UI at the current selection
  superdoc.addComment();
});

// Helper function to format dates
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}
```

### Document Version Comparison

This example shows how to implement a simple version comparison between two documents.

```javascript
// HTML setup
// <div class="comparison-container">
//   <div id="document-original" class="document-half"></div>
//   <div id="document-modified" class="document-half"></div>
// </div>

// Load two versions of the document
const originalDoc = new SuperDoc({
  selector: '#document-original',
  documents: [
    {
      id: 'original-doc',
      type: 'docx',
      data: originalFile,
    },
  ],
  documentMode: 'viewing', // Set to viewing mode
});

const modifiedDoc = new SuperDoc({
  selector: '#document-modified',
  documents: [
    {
      id: 'modified-doc',
      type: 'docx',
      data: modifiedFile,
    },
  ],
  documentMode: 'viewing', // Set to viewing mode
});

// Synchronize scrolling between the two documents
document.getElementById('document-original').addEventListener('scroll', (e) => {
  const scrollPos = e.target.scrollTop;
  document.getElementById('document-modified').scrollTop = scrollPos;
});

document.getElementById('document-modified').addEventListener('scroll', (e) => {
  const scrollPos = e.target.scrollTop;
  document.getElementById('document-original').scrollTop = scrollPos;
});
```

## FAQ

### General Questions

**Q: What file formats does SuperDoc support?**  
A: SuperDoc fully supports DOCX for editing and PDF for viewing.

**Q: Is SuperDoc free to use?**  
A: SuperDoc is available under dual licensing:

- AGPLv3 license for open source and community use
- Commercial license for enterprise and proprietary applications

**Q: Does SuperDoc work offline?**  
A: SuperDoc can work offline for basic editing, but collaboration features require an internet connection.

**Q: How does SuperDoc compare to other document editors?**  
A: SuperDoc focuses on Microsoft Word compatibility, real-time collaboration, and ease of integration into web applications. Unlike many alternatives, it provides a full-featured DOCX editing experience directly in the browser.

### Technical Questions

**Q: How do I implement real-time collaboration?**  
A: SuperDoc uses Yjs for collaboration. You'll need to:

1. Set up a Yjs collaboration server (like Hocuspocus)
2. Configure the collaboration module with your server URL and authentication
3. Ensure each client uses the same document ID

**Q: Can I extend SuperDoc with custom functionality?**  
A: Yes, SuperDoc is designed to be extensible through its module system.

**Q: How do I debug issues with SuperDoc?**  
A: Enable debug logging with:

```javascript
const superdoc = new SuperDoc({
  // ...your config
  debug: true,
});
```

**Q: What browsers does SuperDoc support?**  
A: SuperDoc supports all modern browsers, including:

- Chrome 85+
- Firefox 86+
- Safari 14+
- Edge 85+

## Guides

### Migrate from Prosemirror

If you're already using Prosemirror for your document editing needs, migrating to SuperDoc can provide significant advantages. SuperDoc builds upon Prosemirror's powerful core while adding ready-to-use components and features.

#### Key Differences

| Prosemirror                             | SuperDoc                                           |
| --------------------------------------- | -------------------------------------------------- |
| Low-level editor framework              | Complete document editing solution                 |
| Schema must be defined manually         | Pre-built schemas optimized for Word compatibility |
| Plugins require manual configuration    | Common plugins come pre-configured                 |
| No built-in file format support         | Native DOCX and PDF support                        |
| Collaboration requires additional setup | Built-in collaboration with Yjs                    |

#### Migration Steps

1. **Replace Dependencies**

   ```bash
   npm uninstall prosemirror-state prosemirror-view prosemirror-model prosemirror-transform
   npm install @harbour-enterprises/superdoc
   ```

2. **Rewrite Initialization Code**

   ```javascript
   // OLD Prosemirror code
   import { EditorState } from 'prosemirror-state';
   import { EditorView } from 'prosemirror-view';
   import { Schema } from 'prosemirror-model';

   // ... schema definition, plugins, etc.

   // NEW SuperDoc code
   import { SuperDoc } from '@harbour-enterprises/superdoc';

   const superdoc = new SuperDoc({
     selector: '#editor',
     documents: [
       {
         id: 'my-document',
         type: 'docx',
         data: docxFile,
       },
     ],
   });
   ```

3. **Accessing Prosemirror Instances**

   While SuperDoc doesn't currently support custom Prosemirror plugins or extensions, you can still access the underlying Prosemirror instances:

   ```javascript
   superdoc.on('editorCreate', ({ editor }) => {
     // Access Prosemirror view
     const view = editor.view;

     // Access Prosemirror state
     const state = view.state;

     // Note: SuperDoc doesn't currently provide a way to add custom
     // Prosemirror plugins or extensions
   });
   ```

   SuperDoc modules (which are configured in the initialization options) serve different purposes than Prosemirror plugins and aren't used as direct replacements.

#### Migrating Document Operations

Replace your Prosemirror document operation handlers:

```javascript
// OLD Prosemirror document operations
view.dispatch(view.state.tr.insertText('Hello world'));

// Get content
const content = view.state.doc.content;

// NEW SuperDoc operations
// Access the editor through events
superdoc.on('editorCreate', ({ editor }) => {
  // Insert content using editor commands
  editor.commands.insertContent('Hello world');
});

// Get content
superdoc.exportDocx().then((docxFile) => {
  // Use the exported DOCX
});
```

## License

SuperDoc is available under dual licensing:

- **Open Source**: [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html)
- **Commercial**: [Enterprise License](https://www.harbourshare.com/request-a-demo)

For questions about licensing, please contact [q@superdoc.dev](mailto:q@superdoc.dev).

## Contributing

We welcome contributions from the community! Here's how you can help:

1. Check our [issue tracker](https://github.com/Harbour-Enterprises/SuperDoc/issues) for open issues
2. Fork the repository and create a feature/bugfix branch
3. Write clear, documented code following our style guidelines
4. Submit a PR with detailed description of your changes

See our [Contributing Guide](https://github.com/Harbour-Enterprises/SuperDoc/blob/main/CONTRIBUTING.md) for more details.

## Next Steps

- See [Components](/components/) for detailed component reference
- Check out [Integration](/integration/) for framework-specific integration guides
- Learn more about [Getting Started](/) for basic concepts and setup
