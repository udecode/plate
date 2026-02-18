# Fully Vendored Mammoth

## Overview

`mammoth.browser.js` is a browserified bundle of mammoth v1.11.0 (custom fork with tracking changes support). All dependencies are inlined — no external requires at runtime.

## How to Rebuild

From `packages/docx-io/src/lib/mammoth.js/`:

```bash
# Install mammoth's deps (including browserify)
cd packages/docx-io/src/lib/mammoth.js
npm install

# Build the browser bundle
npx browserify lib/index.js --standalone mammoth -p browserify-prepend-licenses -o mammoth.browser.js
```

## Dependencies (inlined in bundle)

| Package | Version | Purpose |
|---------|---------|---------|
| `@xmldom/xmldom` | ^0.8.6 | XML DOM parser |
| `base64-js` | ^1.5.1 | Base64 encoding |
| `bluebird` | ~3.4.0 | Promise library |
| `dingbat-to-unicode` | ^1.0.1 | Dingbat font → Unicode |
| `jszip` | ^3.10.1 | ZIP file handling |
| `lop` | ^0.4.2 | Parser combinators |
| `underscore` | ^1.13.1 | Utility library |
| `xmlbuilder` | ^10.0.0 | XML building |

**Not bundled (unused):** `argparse` (CLI only), `path-is-absolute` (Node fs only)

## Browser Field Replacements

```json
{
  "./lib/unzip.js": "./browser/unzip.js",
  "./lib/docx/files.js": "./browser/docx/files.js"
}
```

These swap Node.js file-system modules with browser-safe stubs.

## Usage in docx-io

Only `convertToHtml(arrayBuffer, options)` is used:

```typescript
import mammothModule from './mammoth.js/mammoth.browser.js';
const result = await mammoth.convertToHtml({ arrayBuffer }, { styleMap: [...] });
```

## Custom Fork Changes

This is NOT stock mammoth. Custom modifications include tracking changes/comments support for the DOCX import pipeline. Any rebuild must use THIS source, not npm mammoth.
