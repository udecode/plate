# feat: Add DOCX export plugin

## Summary

This PR adds a new `@platejs/docx-export` plugin that enables exporting Plate.js editor content to Microsoft Word (DOCX) format entirely in the browser.

## Motivation

Many users need to export their editor content to Word format for sharing with colleagues, printing, or archival purposes. Currently, Plate.js has DOCX import support via `@platejs/docx`, but there's no official export solution. This plugin fills that gap.

## Features

- **Browser-only export** - No server-side processing required
- **Rich formatting support**:
  - Text formatting (bold, italic, underline, strikethrough, superscript, subscript)
  - Headings (h1-h6)
  - Lists (ordered, unordered, nested)
  - Tables with headers
  - Blockquotes
  - Code blocks and inline code
  - Links
  - Inline images (base64)
  - Horizontal rules
- **Customization options**:
  - Page orientation (portrait/landscape)
  - Page margins
  - Custom CSS styles
  - Font family override
- **Developer experience**:
  - Full TypeScript support
  - Comprehensive test suite
  - Toolbar button component included

## Implementation Details

The plugin uses `@turbodocx/html-to-docx` to convert HTML to native DOCX elements:

1. Plate.js content is serialized to HTML using `serializeHtml`
2. HTML is wrapped with Word-optimized CSS styles
3. HTML tags are parsed and converted to native DOCX XML elements (`<w:p>`, `<w:r>`, `<w:t>`, tables, images, etc.)
4. DOCX XML is packaged into a proper Office Open XML structure
5. The blob is downloaded via a temporary anchor element

This approach was chosen because:
- It creates proper DOCX structure (not altChunk/MHT embedding which only works in MS Word)
- It works in all word processors (Word, LibreOffice, Google Docs)
- It's fully browser-compatible
- It produces high-quality, editable documents

## API

```tsx
// Simple export
await exportEditorToDocx(editor.children, 'document.docx', {
  orientation: 'portrait',
});

// Get blob for custom handling
const blob = await exportToDocx(editor.children, {
  orientation: 'landscape',
  margins: { top: 720, bottom: 720 },
});

// Use the toolbar button
<DocxExportToolbarButton defaultFilename="my-doc" />
```

## Known Limitations

### Mobile Browser Support ⚠️

Mobile browsers have limited support for programmatic file downloads. The export functionality works best on desktop browsers:

| Platform | Status |
|----------|--------|
| Desktop Chrome/Firefox/Safari/Edge | ✅ Full support |
| iOS Safari | ⚠️ Limited - blob downloads may not work |
| Android Chrome | ⚠️ Limited - may require user interaction |

For mobile users, we recommend:
- Using a server-side export endpoint
- Implementing alternative sharing options (clipboard, Web Share API)

### Other Limitations

- Complex CSS layouts may not render identically in Word
- Some advanced features (comments, track changes) are not supported
- Very large documents may be slow to export

## Testing

The plugin includes comprehensive tests:

- **Unit tests** for the HTML-to-DOCX converter (45+ test cases)
- **Unit tests** for the export plugin (50+ test cases)
- **E2E tests** using Playwright (10+ scenarios)

All tests pass:
```
✓ html-to-docx.test.ts (45 tests)
✓ docx-export-plugin.test.ts (50 tests)
✓ export-docx.spec.ts (10 tests)
```

## Dependencies

- `jszip` (peer dependency) - For creating the DOCX ZIP archive

## Checklist

- [x] Code follows the project's style guidelines
- [x] Self-reviewed the code
- [x] Added comprehensive documentation
- [x] Added unit tests
- [x] Added E2E tests
- [x] TypeScript types are complete
- [x] No breaking changes to existing functionality

## Screenshots

N/A (this is a functionality-focused PR)

## Related Issues

- Closes #XXX (if applicable)

---

**Note to maintainers:** This plugin was developed as a gift to the Plate.js community. Feel free to modify, refactor, or adapt it as needed to fit the project's conventions and architecture.
