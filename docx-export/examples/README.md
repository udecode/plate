# DOCX Export Examples

This folder contains examples demonstrating how to use the `@platejs/docx-export` plugin.

## Examples

### `docx-export-demo.tsx`

A comprehensive demo showing:

1. **`DocxExportDemo`** - Full demo with export dialog UI
2. **`SimpleExportExample`** - Basic standalone export using `exportEditorToDocx`
3. **`PluginApiExample`** - Using the plugin API (`editor.api.docxExport`)

## Quick Start

### Standalone Function (Simplest)

```tsx
import { exportEditorToDocx } from '@platejs/docx-export';

// Export editor content to DOCX
await exportEditorToDocx(editor.children, 'my-document', {
  orientation: 'portrait',
});
```

### Using the Plugin API

```tsx
import { createPlateEditor } from 'platejs/react';
import { DocxExportPlugin } from '@platejs/docx-export';

const editor = createPlateEditor({
  plugins: [DocxExportPlugin],
  value: initialValue,
});

// Get blob for custom handling
const blob = await editor.api.docxExport.exportToBlob({
  orientation: 'landscape',
});

// Download the blob
editor.api.docxExport.download(blob, 'my-document');

// Or use the combined transform
await editor.tf.docxExport.exportAndDownload('my-document');
```

### Using the Toolbar Button

```tsx
import { DocxExportToolbarButton } from '@platejs/docx-export';

function MyToolbar() {
  return (
    <Toolbar>
      <DocxExportToolbarButton defaultFilename="my-document" />
    </Toolbar>
  );
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | `'portrait' \| 'landscape'` | `'portrait'` | Page orientation |
| `margins` | `DocxExportMargins` | 1 inch all sides | Page margins (in twentieths of a point) |
| `fontFamily` | `string` | `'Calibri'` | Document font family |
| `customStyles` | `string` | - | Additional CSS styles |
| `title` | `string` | - | Document title (metadata) |

## Margin Values

Margins are specified in twentieths of a point:

| Inches | Value |
|--------|-------|
| 0.25" | 360 |
| 0.5" | 720 |
| 0.75" | 1080 |
| 1" | 1440 |

Example:

```tsx
await exportEditorToDocx(value, 'document', {
  margins: {
    top: 1440,    // 1 inch
    bottom: 1440, // 1 inch
    left: 1800,   // 1.25 inches
    right: 1800,  // 1.25 inches
  },
});
```
