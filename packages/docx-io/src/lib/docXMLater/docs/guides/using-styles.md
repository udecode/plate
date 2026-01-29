# Using Styles in DocXML

A comprehensive guide to using the Styles system in DocXML for creating professionally formatted Word documents.

## Table of Contents

- [Introduction](#introduction)
- [Built-in Styles](#built-in-styles)
- [Using Styles](#using-styles)
- [Creating Custom Styles](#creating-custom-styles)
- [Style Inheritance](#style-inheritance)
- [Managing Styles](#managing-styles)
- [Best Practices](#best-practices)
- [Complete Examples](#complete-examples)

## Introduction

Styles in Word documents define consistent formatting for text and paragraphs. DocXML provides a complete styles system that includes:

- **13 built-in styles** (Normal, Heading1-9, Title, Subtitle, ListParagraph)
- **Custom style creation** (paragraph and character styles)
- **Style inheritance** (basedOn relationships)
- **Automatic styles.xml generation**

All documents created with `Document.create()` automatically include the built-in styles, ready to use.

## Built-in Styles

### Normal (Default Paragraph Style)

The default paragraph style used for body text.

**Properties:**

- Font: Calibri 11pt
- Spacing After: 200 twips
- Line Spacing: Auto (276 twips)

```typescript
import { Document } from "docxml";

const doc = Document.create();
doc.createParagraph("This is normal body text.").setStyle("Normal");
```

### Heading Styles (Heading1 through Heading9)

Nine heading levels for document structure.

| Style          | Font Size | Bold | Color          | Use Case             |
| -------------- | --------- | ---- | -------------- | -------------------- |
| **Heading1**   | 16pt      | Yes  | Blue (#2E74B5) | Chapter titles       |
| **Heading2**   | 13pt      | Yes  | Blue (#1F4D78) | Section titles       |
| **Heading3**   | 12pt      | Yes  | Blue (#1F4D78) | Subsection titles    |
| **Heading4**   | 11pt      | Yes  | Blue (#1F4D78) | Minor headings       |
| **Heading5-9** | 11pt      | No   | Blue (#1F4D78) | Lower level headings |

**Common Properties:**

- Font: Calibri Light
- Keep with Next: True (stays with following paragraph)
- Keep Lines: True (prevents page breaks within)
- Spacing Before: 240/120 twips
- Spacing After: 120 twips

```typescript
doc.createParagraph("Chapter 1: Introduction").setStyle("Heading1");
doc.createParagraph("Section 1.1").setStyle("Heading2");
doc.createParagraph("Subsection 1.1.1").setStyle("Heading3");
```

### Title Style

Large, prominent style for document titles.

**Properties:**

- Font: Calibri Light 28pt
- Color: Blue (#2E74B5)
- Spacing After: 120 twips

```typescript
doc.createParagraph("Annual Report 2025").setStyle("Title");
```

### Subtitle Style

Secondary title style with italic formatting.

**Properties:**

- Font: Calibri Light 14pt
- Color: Gray (#595959)
- Italic: True
- Spacing After: 120 twips

```typescript
doc.createParagraph("Q4 Financial Results").setStyle("Subtitle");
```

### ListParagraph Style

Style for list items (used with numbering).

**Properties:**

- Based on: Normal
- Left Indent: 720 twips (0.5 inch)

```typescript
doc.createParagraph("First item").setStyle("ListParagraph");
```

## Using Styles

### Applying Styles to Paragraphs

Use the `setStyle()` method on any paragraph:

```typescript
const doc = Document.create();

// Apply style by ID
doc.createParagraph("Title Text").setStyle("Title");
doc.createParagraph("Body text").setStyle("Normal");
doc.createParagraph("Heading").setStyle("Heading1");

await doc.save("styled-document.docx");
```

### Checking if a Style Exists

Before applying a style, you can check if it exists:

```typescript
if (doc.hasStyle("Heading1")) {
  doc.createParagraph("My Heading").setStyle("Heading1");
}
```

### Getting Style Information

Retrieve style details:

```typescript
const heading1 = doc.getStyle("Heading1");
if (heading1) {
  console.log("Style Name:", heading1.getName());
  console.log("Style Type:", heading1.getType());
  const props = heading1.getProperties();
  console.log("Based On:", props.basedOn);
}
```

### Complete Document Example

```typescript
import { Document } from "docxml";

const doc = Document.create({
  properties: {
    title: "Styled Document Example",
    creator: "DocXML",
  },
});

// Title page
doc.createParagraph("My Professional Document").setStyle("Title");
doc.createParagraph("A demonstration of styles").setStyle("Subtitle");
doc.createParagraph(); // Empty line

// Chapter
doc.createParagraph("Chapter 1: Introduction").setStyle("Heading1");
doc.createParagraph("This is the introduction text.").setStyle("Normal");
doc.createParagraph(); // Empty line

// Section
doc.createParagraph("Section 1.1: Background").setStyle("Heading2");
doc.createParagraph("Background information here.").setStyle("Normal");

await doc.save("professional-document.docx");
```

## Creating Custom Styles

### Custom Paragraph Style

Create a custom paragraph style with specific formatting:

```typescript
import { Document, Style } from "docxml";

const doc = Document.create();

// Create custom style
const customStyle = Style.create({
  styleId: "MyCustomStyle",
  name: "My Custom Style",
  type: "paragraph",
  basedOn: "Normal",
  customStyle: true,
  paragraphFormatting: {
    alignment: "center",
    spacing: {
      before: 240,
      after: 240,
    },
  },
  runFormatting: {
    bold: true,
    color: "0066CC",
    size: 14,
  },
});

// Add to document
doc.addStyle(customStyle);

// Use the custom style
doc.createParagraph("Custom Styled Text").setStyle("MyCustomStyle");

await doc.save("custom-styles.docx");
```

### Custom Character Style

Character styles apply to text runs rather than entire paragraphs:

```typescript
const charStyle = Style.create({
  styleId: "Emphasis",
  name: "Emphasis",
  type: "character",
  customStyle: true,
  runFormatting: {
    bold: true,
    italic: true,
    color: "FF0000",
  },
});

doc.addStyle(charStyle);

// Note: Character styles are applied differently
// (currently paragraph-level only in Phase 3)
```

### Using StylesManager Helpers

Create custom styles more easily:

```typescript
const stylesManager = doc.getStylesManager();

// Create paragraph style
const alertStyle = stylesManager.createParagraphStyle(
  "Alert",
  "Alert Style",
  "Normal" // basedOn
);

alertStyle.setRunFormatting({
  bold: true,
  color: "FF0000",
  size: 12,
});

alertStyle.setParagraphFormatting({
  alignment: "center",
  spacing: { before: 120, after: 120 },
});

// Use it
doc.createParagraph("⚠ Important Alert").setStyle("Alert");
```

## Style Inheritance

Styles can inherit from other styles using the `basedOn` property.

### Understanding basedOn

When a style is based on another style:

1. It inherits all formatting from the parent
2. It can override specific properties
3. Changes to the parent affect child styles

```typescript
// Base style
const baseStyle = Style.create({
  styleId: "BaseText",
  name: "Base Text",
  type: "paragraph",
  runFormatting: {
    font: "Arial",
    size: 11,
  },
});

// Child style inherits font and size
const highlightStyle = Style.create({
  styleId: "HighlightText",
  name: "Highlight Text",
  type: "paragraph",
  basedOn: "BaseText",
  runFormatting: {
    bold: true, // Added property
    color: "FF0000", // Added property
    // font: 'Arial'   // Inherited
    // size: 11        // Inherited
  },
});

doc.addStyle(baseStyle);
doc.addStyle(highlightStyle);
```

### Built-in Style Hierarchy

All heading styles are based on Normal:

```
Normal (root)
├── Heading1 (based on Normal)
├── Heading2 (based on Normal)
├── Heading3 (based on Normal)
├── ...
├── Title (based on Normal)
├── Subtitle (based on Normal)
└── ListParagraph (based on Normal)
```

## Managing Styles

### Accessing the StylesManager

```typescript
const doc = Document.create();
const stylesManager = doc.getStylesManager();

// Get style count
console.log(`Total styles: ${stylesManager.getStyleCount()}`);

// Get all styles
const allStyles = stylesManager.getAllStyles();
allStyles.forEach((style) => {
  console.log(`- ${style.getName()} (${style.getStyleId()})`);
});

// Get styles by type
const paragraphStyles = stylesManager.getStylesByType("paragraph");
console.log(`Paragraph styles: ${paragraphStyles.length}`);
```

### Removing Styles

Remove custom styles (built-in styles should not be removed):

```typescript
stylesManager.removeStyle("MyCustomStyle");
```

### Clearing All Styles

Clear all styles (use with caution):

```typescript
stylesManager.clear();

// Re-initialize with built-in styles if needed
// Note: Document.create() automatically includes built-in styles
```

## Best Practices

### 1. Use Built-in Styles When Possible

Built-in styles ensure consistency and compatibility:

```typescript
// ✅ Good
doc.createParagraph("Chapter Title").setStyle("Heading1");

// ❌ Avoid
const para = doc.createParagraph("Chapter Title");
para.addText("Chapter Title", { bold: true, size: 16, color: "2E74B5" });
```

### 2. Base Custom Styles on Normal

Always base custom styles on an existing style:

```typescript
// ✅ Good
Style.create({
  styleId: "MyStyle",
  name: "My Style",
  type: "paragraph",
  basedOn: "Normal", // ✅ Inherits default formatting
  // ...
});

// ⚠️ Risky
Style.create({
  styleId: "MyStyle",
  name: "My Style",
  type: "paragraph",
  // No basedOn - starts from scratch
});
```

### 3. Use Meaningful Style IDs and Names

```typescript
// ✅ Good
styleId: "CodeBlock";
name: "Code Block";

// ❌ Avoid
styleId: "style1";
name: "Style 1";
```

### 4. Group Related Content with Styles

```typescript
// Document structure
doc.createParagraph("Report").setStyle("Title");
doc.createParagraph("Q4 2025").setStyle("Subtitle");
doc.createParagraph();

// Main content
doc.createParagraph("Executive Summary").setStyle("Heading1");
doc.createParagraph("Summary text...").setStyle("Normal");

doc.createParagraph("Financial Results").setStyle("Heading1");
doc.createParagraph("Section 1.1").setStyle("Heading2");
doc.createParagraph("Details...").setStyle("Normal");
```

### 5. Test Styles in Microsoft Word

Always verify your styled documents in Word to ensure compatibility:

```typescript
const doc = Document.create();
// ... add content with styles ...
await doc.save("test-styles.docx");
// Open in Microsoft Word to verify
```

## Complete Examples

### Example 1: Professional Report

```typescript
import { Document } from "docxml";

const doc = Document.create({
  properties: {
    title: "Annual Report 2025",
    creator: "DocXML",
    subject: "Financial Report",
  },
});

// Cover page
doc.createParagraph("Annual Report").setStyle("Title");
doc.createParagraph("Fiscal Year 2025").setStyle("Subtitle");
doc.createParagraph();
doc.createParagraph();

// Executive Summary
doc.createParagraph("Executive Summary").setStyle("Heading1");
doc.createParagraph("This report summarizes...").setStyle("Normal");
doc.createParagraph();

// Chapter 1
doc.createParagraph("Chapter 1: Financial Performance").setStyle("Heading1");
doc.createParagraph("Section 1.1: Revenue").setStyle("Heading2");
doc.createParagraph("Revenue increased by 15%...").setStyle("Normal");
doc.createParagraph();

doc.createParagraph("Section 1.2: Expenses").setStyle("Heading2");
doc.createParagraph("Operating expenses...").setStyle("Normal");

await doc.save("annual-report.docx");
```

### Example 2: Custom Styles for Branding

```typescript
import { Document, Style } from "docxml";

const doc = Document.create();

// Create branded styles
const brandTitle = Style.create({
  styleId: "BrandTitle",
  name: "Brand Title",
  type: "paragraph",
  basedOn: "Title",
  runFormatting: {
    font: "Montserrat",
    color: "1a237e", // Brand color
    size: 32,
    bold: true,
  },
  paragraphFormatting: {
    alignment: "center",
    spacing: { after: 480 },
  },
});

const brandHeading = Style.create({
  styleId: "BrandHeading",
  name: "Brand Heading",
  type: "paragraph",
  basedOn: "Heading1",
  runFormatting: {
    font: "Montserrat",
    color: "3949ab",
    size: 18,
  },
});

const brandBody = Style.create({
  styleId: "BrandBody",
  name: "Brand Body",
  type: "paragraph",
  basedOn: "Normal",
  runFormatting: {
    font: "Open Sans",
    size: 11,
  },
  paragraphFormatting: {
    alignment: "justify",
    spacing: { after: 200 },
  },
});

// Add to document
doc.addStyle(brandTitle);
doc.addStyle(brandHeading);
doc.addStyle(brandBody);

// Use branded styles
doc.createParagraph("Company Name").setStyle("BrandTitle");
doc.createParagraph("Our Story").setStyle("BrandHeading");
doc.createParagraph("We are a company...").setStyle("BrandBody");

await doc.save("branded-document.docx");
```

### Example 3: Multi-Level Document Structure

```typescript
const doc = Document.create();

// Title
doc.createParagraph("Technical Documentation").setStyle("Title");
doc.createParagraph("Version 1.0").setStyle("Subtitle");
doc.createParagraph();

// Part 1
doc.createParagraph("Part I: Getting Started").setStyle("Heading1");
doc.createParagraph("Chapter 1: Installation").setStyle("Heading2");
doc.createParagraph("Section 1.1: Prerequisites").setStyle("Heading3");
doc.createParagraph("You need Node.js installed...").setStyle("Normal");

// Part 2
doc.createParagraph("Part II: Advanced Topics").setStyle("Heading1");
doc.createParagraph("Chapter 3: Architecture").setStyle("Heading2");
doc.createParagraph("Section 3.1: Overview").setStyle("Heading3");
doc.createParagraph("The architecture consists of...").setStyle("Normal");
doc.createParagraph("Subsection 3.1.1: Core Components").setStyle("Heading4");
doc.createParagraph("Core components include...").setStyle("Normal");

await doc.save("technical-docs.docx");
```

## See Also

- [API Reference: Style](../api/Style.md)
- [API Reference: Document](../api/Document.md)
- [Guide: Creating Documents](./creating-documents.md)
- [Guide: Formatting Text](./formatting-text.md)
- [Examples: Style Examples](../../examples/04-styles/)

---

**Next Steps:**

- Learn about [Working with Tables](./working-with-tables.md)
- Explore [Advanced Usage](./advanced-usage.md)
- Check out [Complete Examples](../../examples/05-complete/)
