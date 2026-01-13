# @platejs/docx-export

Export [Plate.js](https://platejs.org/) editor content to Microsoft Word (DOCX) format. This plugin enables users to download their rich text editor content as a properly formatted Word document that can be opened in Microsoft Word, Google Docs, LibreOffice, and other word processors.

## Features

- **Browser-only** - No server-side processing required
- **Rich formatting support** - Bold, italic, underline, strikethrough, superscript, subscript
- **Structural elements** - Headings (h1-h6), paragraphs, lists (ordered, unordered, nested)
- **Tables** - Full table support with headers
- **Block elements** - Blockquotes, code blocks, horizontal rules
- **Inline elements** - Links, inline code
- **Images** - Inline images (base64 encoded)
- **Customization** - Page orientation, margins, custom CSS, font family
- **TypeScript** - Fully typed API

## Installation

```bash
npm install @platejs/docx-export jszip
# or
yarn add @platejs/docx-export jszip
# or
pnpm add @platejs/docx-export jszip
```

## Quick Start

### Basic Export

```tsx
import { exportEditorToDocx } from '@platejs/docx-export';

// In a button click handler:
const handleExport = async () => {
  await exportEditorToDocx(editor.children, 'my-document', {
    orientation: 'portrait',
  });
};
```

### Using the Plugin

```tsx
import { DocxExportPlugin } from '@platejs/docx-export';

const plugins = [
  // ... other plugins
  DocxExportPlugin,
];
```

### Using the Toolbar Button

```tsx
import { DocxExportToolbarButton } from '@platejs/docx-export';

function EditorToolbar() {
  return (
    <Toolbar>
      <DocxExportToolbarButton defaultFilename="my-document" />
    </Toolbar>
  );
}
```

## API Reference

### `exportToDocx(value, options?)`

Converts Plate.js editor content to a DOCX blob.

```tsx
const blob = await exportToDocx(editor.children, {
  orientation: 'landscape',
  margins: { top: 720, bottom: 720 }, // 0.5 inch
  fontFamily: 'Arial',
  customStyles: '.highlight { background-color: yellow; }',
});
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | `Value` | The Plate.js editor value (array of nodes) |
| `options` | `DocxExportOptions` | Optional configuration |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | `'portrait' \| 'landscape'` | `'portrait'` | Page orientation |
| `margins` | `DocxExportMargins` | 1 inch all sides | Page margins in twentieths of a point |
| `fontFamily` | `string` | `'Calibri'` | Document font family |
| `customStyles` | `string` | - | Additional CSS styles |
| `title` | `string` | - | Document title (metadata) |
| `editorPlugins` | `PlatePlugin[]` | - | Plugins for HTML serialization |
| `editorStaticComponent` | `React.ComponentType` | - | Static editor component |

**Returns:** `Promise<Blob>` - The DOCX file as a blob

### `downloadDocx(blob, filename)`

Downloads a blob as a DOCX file.

```tsx
const blob = await exportToDocx(editor.children);
downloadDocx(blob, 'my-document'); // Downloads as my-document.docx
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `blob` | `Blob` | The DOCX blob to download |
| `filename` | `string` | Filename (with or without .docx extension) |

### `exportEditorToDocx(value, filename, options?)`

Convenience function that combines `exportToDocx` and `downloadDocx`.

```tsx
await exportEditorToDocx(editor.children, 'my-document', {
  orientation: 'portrait',
});
```

### `htmlToDocxBlob(html, options?)`

Low-level function that converts raw HTML to a DOCX blob.

```tsx
import { htmlToDocxBlob } from '@platejs/docx-export';

const html = '<h1>Hello</h1><p>World</p>';
const blob = await htmlToDocxBlob(html, { orientation: 'landscape' });
```

## Margin Configuration

Margins are specified in twentieths of a point. Common conversions:

| Inches | Twentieths |
|--------|------------|
| 0.25" | 360 |
| 0.5" | 720 |
| 0.75" | 1080 |
| 1" | 1440 |
| 1.25" | 1800 |
| 1.5" | 2160 |

```tsx
await exportToDocx(value, {
  margins: {
    top: 1440,    // 1 inch
    bottom: 1440, // 1 inch
    left: 1800,   // 1.25 inches
    right: 1800,  // 1.25 inches
    header: 720,  // 0.5 inch
    footer: 720,  // 0.5 inch
    gutter: 0,    // No gutter
  },
});
```

## Custom Styles

You can add custom CSS styles that will be included in the document:

```tsx
await exportToDocx(value, {
  customStyles: `
    .highlight {
      background-color: #ffeb3b;
      padding: 2px 4px;
    }
    .important {
      color: #d32f2f;
      font-weight: bold;
    }
  `,
});
```

## Default Styles

The plugin includes Word-optimized default styles (`DOCX_EXPORT_STYLES`):

- **Body**: Calibri, 11pt, 1.5 line-height
- **Headings**: 24pt (h1) down to 10pt (h6)
- **Tables**: Collapsed borders, gray headers
- **Code**: Courier New, light gray background
- **Blockquotes**: Left border, italic, gray text
- **Links**: Blue, underlined

## Platform Support

### Desktop Browsers ✅

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |

### Mobile Browsers ⚠️

| Platform | Support | Notes |
|----------|---------|-------|
| iOS Safari | ⚠️ Limited | Blob downloads may not work as expected |
| Chrome Android | ⚠️ Limited | May require user interaction |
| Other mobile | ⚠️ Limited | Results may vary |

**Note:** Mobile browser support is limited due to restrictions on programmatic file downloads. For mobile users, consider:
- Using a server-side export endpoint
- Showing a "Copy to clipboard" alternative
- Implementing a "Share" option using the Web Share API

## How It Works

The plugin uses `@turbodocx/html-to-docx` to convert HTML to native DOCX elements:

1. **Serialize** - Plate.js editor content is serialized to HTML using `serializeHtml`
2. **Wrap** - HTML is wrapped in a complete document with Word-optimized styles
3. **Convert** - HTML tags are parsed and converted to native DOCX XML elements (`<w:p>`, `<w:r>`, `<w:t>`, tables, images, etc.)
4. **Package** - The DOCX XML is packaged into a ZIP archive with proper Office Open XML structure
5. **Download** - The blob is downloaded using a temporary anchor element

This approach:
- Creates proper DOCX structure (not altChunk/MHT embedding)
- Works in all word processors (Word, LibreOffice, Google Docs)
- Is fully browser-compatible (no server required)
- Produces high-quality, editable documents

## Testing

The plugin includes comprehensive tests:

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- DOCX file structure validation
- Content preservation
- Orientation and margin settings
- Image embedding
- Unicode and special character handling

## TypeScript

Full TypeScript support with exported types:

```tsx
import type {
  DocxExportMargins,
  DocxExportOptions,
  DocxExportOrientation,
  DocxExportToolbarButtonProps,
  DocumentMargins,
  DocumentOptions,
} from '@platejs/docx-export';
```

## Related Packages

- [`@platejs/docx`](https://platejs.org/docs/docx) - Import DOCX files into Plate.js
- [`@platejs/html`](https://platejs.org/docs/html) - HTML serialization/deserialization
- [`@platejs/markdown`](https://platejs.org/docs/markdown) - Markdown support

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](https://github.com/udecode/plate/blob/main/CONTRIBUTING.md) before submitting a pull request.
