# Using Table of Contents

This guide covers how to create, configure, and use Table of Contents (TOC) in docXMLater.

## Overview

The Table of Contents implementation in docXMLater creates a validated Word TOC that complies with Microsoft's ECMA-376 specification. The TOC is wrapped in a Structured Document Tag (SDT) and uses the complete field structure required by Word.

## Quick Start

```typescript
import { Document } from '../core/Document';
import { TableOfContents } from '../elements/TableOfContents';
import { Style } from '../formatting/Style';

// Create document
const doc = new Document();

// Add required TOC styles
doc.addStyle(Style.createTOCHeadingStyle());
doc.addStyle(Style.createTOC1Style());
doc.addStyle(Style.createTOC2Style());
doc.addStyle(Style.createTOC3Style());
doc.addStyle(Style.createTOC4Style());

// Create TOC with 4 levels, hyperlinks, no page numbers
const toc = TableOfContents.create({
  title: "Table of Contents",
  showPageNumbers: false,
  useHyperlinks: true,
  levels: 4
});

// Add TOC to document
doc.addTableOfContents(toc);

// Add some sample headings
doc.addHeading("Chapter 1", "Heading1");
doc.addParagraph("This is the first chapter.");
doc.addHeading("Section 1.1", "Heading2");
doc.addParagraph("Content for section 1.1.");
doc.addHeading("Section 1.2", "Heading3");
doc.addParagraph("Content for section 1.2.");
doc.addHeading("Section 1.3", "Heading4");
doc.addParagraph("Content for section 1.3.");

// Generate document
const docx = doc.save();

console.log('Document saved to:', docx);
```

## TableOfContents.create()

Creates a new Table of Contents with the specified options.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|--------|-------------|
| `title` | string | "Table of Contents" | TOC title text |
| `levels` | number | 3 | Number of heading levels to include (1-9) |
| `showPageNumbers` | boolean | true | Whether to show page numbers |
| `useHyperlinks` | boolean | false | Whether to use hyperlinks instead of page numbers |
| `rightAlignPageNumbers` | boolean | true | Whether to right-align page numbers |
| `tabLeader` | string | "dot" | Tab leader character for page numbers |
| `style` | string | "TOC" | Custom TOC style name |
| `fieldSwitches` | string | undefined | Additional field switches |
| `hideInWebLayout` | boolean | false | Hide page numbers in web layout (\z switch) |
| `numbered` | boolean | false | Whether TOC entries should be numbered |
| `numberingFormat` | string | "decimal" | Numbering format (decimal, roman, alpha) |
| `noIndent` | boolean | false | Remove all indentation from TOC entries |
| `customIndents` | number[] | undefined | Custom indentation for each TOC level |
| `spaceBetweenEntries` | number | 0 | Space between TOC entries in twips |
| `hyperlinkColor` | string | "0000FF" | Hyperlink color in hex |

### Returns

- **Type:** `TableOfContents`

### Examples

#### Basic TOC
```typescript
const toc = TableOfContents.create();
```

#### TOC with 4 Levels and Hyperlinks
```typescript
const toc = TableOfContents.create({
  title: "Table of Contents",
  levels: 4,
  showPageNumbers: false,
  useHyperlinks: true
});
```

#### TOC without Page Numbers
```typescript
const toc = TableOfContents.create({
  title: "Table of Contents",
  showPageNumbers: false,
  useHyperlinks: true
});
```

#### Hyperlinked TOC with No Page Numbers in Web Layout
```typescript
const toc = TableOfContents.createNoPageNumbers({
  title: "Table of Contents",
  levels: 4
});
```

## Configuration Options

### Field Instruction Switches

The TOC field instruction includes these switches automatically:

| Switch | Purpose | Example |
|--------|---------|--------|
| `\o "1-4"` | Include outline levels 1-4 | `\o "1-3"` for 3 levels |
| `\h` | Create hyperlinks | `\h` adds hyperlink support |
| `\n` | Omit page numbers | `\n` removes page number display |
| `\z` | Hide in web layout | `\z` hides page numbers in web view |
| `\* MERGEFORMAT` | Preserve formatting | `\* MERGEFORMAT` maintains formatting on updates |

### Style Requirements

For proper TOC display, these styles must be added to your document:

```typescript
// Required styles for 4-level TOC
doc.addStyle(Style.createTOCHeadingStyle());  // TOC title
doc.addStyle(Style.createTOC1Style());      // Level 1 entries
doc.addStyle(Style.createTOC2Style());      // Level 2 entries
doc.addStyle(Style.createTOC3Style());      // Level 3 entries
doc.addStyle(Style.createTOC4Style());      // Level 4 entries
```

**TOC Style Properties:**
- **Spacing:** 0pt before and after (no gaps between entries)
- **Color:** Blue (#0000FF) for hyperlinks
- **Font:** Verdana 12pt with underline
- **Indentation:** Progressive (0, 360, 720, 1080 twips)

## Integration

### Adding TOC to Document

```typescript
import { Document } from '../core/Document';
import { TableOfContents } from '../elements/TableOfContents';
import { Style } from '../formatting/Style';

const doc = new Document();

// Add required TOC styles
doc.addStyle(Style.createTOCHeadingStyle());
doc.addStyle(Style.createTOC1Style());
doc.addStyle(Style.createTOC2Style());
doc.addStyle(Style.createTOC3Style());
doc.addStyle(Style.createTOC4Style());

// Add TOC
const toc = TableOfContents.create({
  title: "Table of Contents",
  levels: 4,
  showPageNumbers: false,
  useHyperlinks: true
});

doc.addTableOfContents(toc);
```

## XML Structure

The generated TOC follows this structure:

```xml
<w:sdt>
  <w:sdtPr docPartGallery="Table of Contents" docPartUnique="true"/>
  <w:sdtContent>
    <w:p w:rsidR="00A812345">
      <w:pPr>
        <w:pStyle w:val="TOCHeading"/>
      </w:pPr>
      <w:r>
        <w:t>Table of Contents</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="TOC1"/>
      </w:pPr>
      <w:r>
        <w:fldChar w:fldCharType="begin"/>
        <w:instrText xml:space="preserve">TOC \o "1-4" \h \z \n \* MERGEFORMAT</w:instrText>
        <w:fldChar w:fldCharType="separate"/>
        <w:rPr>
          <w:noProof/>
          <w:color w:val="0000FF"/>
          <w:u w:val="single"/>
        </w:rPr>
        <w:t>Right-click to update field.</w:t>
        <w:fldChar w:fldCharType="end"/>
      </w:r>
    </w:p>
  </w:sdtContent>
</w:sdt>
```

## Field Instruction Format

The TOC field instruction format:

```
TOC \o "1-4" \h \z \n \* MERGEFORMAT
```

Components:
- `TOC` - Field type identifier
- `\o "1-4"` - Include outline levels 1-4
- `\h` - Create hyperlinks
- `\z` - Hide page numbers in web layout
- `\n` - No page numbers
- `\* MERGEFORMAT` - Preserve formatting

## Validation and Error Handling

The implementation includes comprehensive validation:

```typescript
// Field structure validation
if (tocParagraph.children!.length !== 5) {
  throw new Error(
    `CRITICAL: TOC field structure incomplete. Expected 5 elements ` +
    `(begin, instruction, separate, content, end), got ${tocParagraph.children!.length}. ` +
    `This would create an invalid OpenXML document per ECMA-376 §17.16.5.`
  );
}
```

## Troubleshooting

### Common Issues

#### TOC Not Displaying
1. **Missing Field End:** Ensure the field structure has all 5 elements
2. **Invalid SDT Structure:** Verify the SDT wrapper has correct properties
3. **Missing Styles:** Ensure all TOC1-TOC4 styles are added to document

#### TOC Not Updating
1. **No Headings:** Ensure document contains heading styles (Heading1-Heading4)
2. **Wrong Levels:** Check TOC levels match document heading levels

### Debug Tips

```typescript
// Enable debug logging
const toc = TableOfContents.create({
  title: "Table of Contents",
  showPageNumbers: false,
  useHyperlinks: true,
  levels: 4
});

console.log('Field instruction:', toc.getFieldInstruction());
console.log('XML elements:', toc.toXML().length);
```

## Best Practices

1. **Always add TOC styles** before adding the TOC
2. **Use `showPageNumbers: false`** for hyperlinked TOCs
3. **Set appropriate levels** based on document structure
4. **Test in Word** to verify TOC updates correctly
5. **Use `TableOfContents.createNoPageNumbers()`** for web documents

## Migration from Existing TOC

If you have an existing TOC that needs updating:

```typescript
// The reformTOCs helper can extract and recreate TOCs
import { reformTOCs } from './reformat-toc';

async function updateExistingTOC(doc: Document): Promise<void> {
  await reformTOCs(doc);
}
```

## Related Classes

- [`Style.createTOCHeadingStyle()`](../formatting/Style.ts) - TOC heading style
- [`Style.createTOC1Style()`](../formatting/Style.ts) - Level 1 TOC style
- [`Style.createTOC2Style()`](../formatting/Style.ts) - Level 2 TOC style
- [`Style.createTOC3Style()`](../formatting/Style.ts) - Level 3 TOC style
- [`Style.createTOC4Style()`](../formatting/Style.ts) - Level 4 TOC style
