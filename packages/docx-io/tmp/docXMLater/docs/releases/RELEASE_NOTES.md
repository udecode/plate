# docXMLater v5.0.0 Release Notes

## Release Date: November 19, 2025

### Major Release

This major version introduces significant enhancements, including a new CleanupHelper class and various fixes and improvements since the last documented release.

## Key Features Added

### CleanupHelper
- New utility class for comprehensive document cleanup
- Methods include: unlockSDTs, removeSDTs, clearPreserveFlags, defragmentHyperlinks, cleanupNumbering, cleanupStyles, cleanupRelationships, removeCustomXML, unlockFields, unlockFrames, sanitizeTables
- Preset configurations: googleDocsPreset, fullCleanupPreset, minimalPreset
- Run all cleanups with `cleanup.all()` or selective with `cleanup.run(options)`

## Major Bug Fixes

### TOC Field Instruction Parsing
- Enhanced support for \o switch formats (unquoted, single-quoted, double-quoted)
- Fixed extraction bug for fields with multiple w:fldChar in single run
- Added multi-paragraph support for field tracking

### Other Fixes
- Removed overly aggressive Document.cleanFormatting() method
- Fixed type error in CleanupHelper for RunFormatting access
- Various improvements to hyperlink handling, list formatting, and special character serialization

## Breaking Changes

- Removed Document.cleanFormatting() - Use Paragraph.clearDirectFormattingConflicts() instead
- Updated list indentation formula to match Microsoft Word standards
- Default bullet font changed from 'Symbol' to 'Calibri'

## What's Included

### New Features
- CleanupHelper with 12 cleanup operations
- Enhanced TOC parsing with 10 new regression tests
- Special character handling in runs (tabs, newlines, hyphens)

### Improvements
- WordDocumentProcessor optimizations
- Expanded numbered list formats to 5 levels
- Improved bullet symbol display

### Test Improvements
- 2073+ tests across 59 files
- 100% pass rate
- New coverage for TOC parsing, cleanup operations, special characters

## Test Suite Status

| Metric | Value |
|--------|-------|
| **Total Tests** | 2073+ |
| **Passing** | 100% |
| **Coverage** | Comprehensive across all modules |

## Migration Guide

See CHANGELOG.md for detailed migration notes, especially for list formatting changes.

## Installation

```bash
npm install docxmlater@5.0.0
```

## Usage Example

```typescript
import { Document, CleanupHelper } from 'docxmlater';

const doc = await Document.load('document.docx');
const cleanup = new CleanupHelper(doc);
const report = cleanup.all(); // Run all cleanups
console.log(report); // View cleanup statistics
await doc.save('cleaned.docx');
doc.dispose();
```

## Package Information

| Field | Value |
|-------|-------|
| **Name** | docxmlater |
| **Version** | 5.0.0 |
| **License** | MIT |
| **Repository** | https://github.com/ItMeDiaTech/docXMLater |
| **npm** | https://www.npmjs.com/package/docxmlater |

## Links

- GitHub Repository: https://github.com/ItMeDiaTech/docXMLater
- npm Package: https://www.npmjs.com/package/docxmlater
- Documentation: https://github.com/ItMeDiaTech/docXMLater/tree/main/docs
- Examples: https://github.com/ItMeDiaTech/docXMLater/tree/main/examples

## Previous Releases

See CHANGELOG.md for complete version history.

---

Ready to upgrade? Run `npm install docxmlater@5.0.0` to get the latest major version!
