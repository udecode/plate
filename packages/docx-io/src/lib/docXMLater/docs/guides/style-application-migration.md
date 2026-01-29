# Style Application API Migration Guide

## ⚠️ Deprecation Notice

**`applyCustomStylesToDocument()`** is **DEPRECATED** as of v3.6.0 and will be removed in v4.0.0.

**Use [`applyCustomFormattingToExistingStyles()`](../../src/core/Document.ts:3311)** instead.

---

## Why the Change?

### Problems with `applyCustomStylesToDocument()`

1. **Creates Non-Standard Styles** ❌

   - Sets style IDs like `CustomHeader1`, `CustomHeader2`
   - **Never defines these styles** in StylesManager
   - Text falls back to "Normal" style (formatting is lost!)
   - Breaks compatibility with other Word documents

2. **No Actual Style Definitions** ❌

   - Changes paragraph style _references_ only
   - Doesn't modify [`styles.xml`](../../src/core/Document.ts:1392)
   - Formatting won't apply in Word

3. **Limited & Inflexible** ❌
   - Only 3 hardcoded styles (Heading1, Heading2, Normal)
   - Fixed formatting (cannot customize)
   - Cannot preserve user emphasis (bold/italic/underline)

### Benefits of `applyCustomFormattingToExistingStyles()`

1. **Modifies Actual Style Definitions** ✅

   - Updates styles in [`styles.xml`](../../src/core/Document.ts:1392)
   - Works with standard Word styles (Heading1, Heading2, etc.)
   - Changes apply immediately to ALL paragraphs using that style

2. **Clears Direct Formatting Conflicts** ✅

   - Per ECMA-376 §17.7.2: Direct formatting overrides styles
   - Automatically removes conflicting direct formatting
   - Style changes now take effect properly

3. **Fully Customizable** ✅

   - Configure 5 styles: Heading1, Heading2, Heading3, Normal, List Paragraph
   - Full control over fonts, sizes, colors, spacing, etc.
   - **Selective preservation** of bold/italic/underline

4. **Preserve User Emphasis** ✅
   - Keep existing bold/italic/underline formatting
   - Perfect for body text with intentional emphasis
   - Configurable per-style (headings vs. body text)

---

## Migration Examples

### Before (Old Method - DEPRECATED)

```typescript
// ❌ DON'T USE - Creates undefined styles!
const counts = doc.applyCustomStylesToDocument();
console.log(`Updated ${counts.heading1} Heading1 paragraphs`);
// Result: Paragraphs reference "CustomHeader1" which doesn't exist!
```

### After (New Method - RECOMMENDED)

```typescript
// ✅ USE THIS - Updates actual style definitions
doc.applyCustomFormattingToExistingStyles({
  heading1: {
    run: { font: "Verdana", size: 18, bold: true, color: "000000" },
    paragraph: {
      alignment: "left",
      spacing: { before: 0, after: 240, line: 240, lineRule: "auto" },
    },
  },
  heading2: {
    run: { font: "Verdana", size: 14, bold: true, color: "000000" },
    paragraph: {
      alignment: "left",
      spacing: { before: 120, after: 120, line: 240, lineRule: "auto" },
    },
    tableOptions: {
      shading: "BFBFBF",
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 115,
      marginRight: 115,
      tableWidthPercent: 5000,
    },
  },
  normal: {
    run: {
      font: "Verdana",
      size: 12,
      color: "000000",
      // Keep user's emphasis formatting
      preserveBold: true,
      preserveItalic: true,
      preserveUnderline: true,
    },
    paragraph: {
      alignment: "left",
      spacing: { before: 60, after: 60, line: 240, lineRule: "auto" },
    },
  },
});
```

---

## Preserving User Emphasis

### Default Behavior

| Style              | Bold Preserved                  | Italic Preserved | Underline Preserved |
| ------------------ | ------------------------------- | ---------------- | ------------------- |
| Heading1           | ❌ No (enforce consistency)     | ❌ No            | ❌ No               |
| Heading2           | ❌ No (enforce consistency)     | ❌ No            | ❌ No               |
| Heading3           | ❌ No (enforce consistency)     | ❌ No            | ❌ No               |
| **Normal**         | ✅ **Yes** (keep user emphasis) | ❌ No            | ❌ No               |
| **List Paragraph** | ✅ **Yes** (keep user emphasis) | ❌ No            | ❌ No               |

### Example: Keep All Emphasis in Body Text

```typescript
doc.applyCustomFormattingToExistingStyles({
  normal: {
    run: {
      font: "Arial",
      size: 11,
      color: "000000",
      // Preserve ALL user formatting
      preserveBold: true,
      preserveItalic: true,
      preserveUnderline: true,
    },
  },
});
```

**Result:**

- Font changes to Arial 11pt
- User's **bold**, _italic_, and <u>underline</u> are preserved
- Style definition updated in [`styles.xml`](../../src/core/Document.ts:1392)

### Example: Enforce Strict Heading Style

```typescript
doc.applyCustomFormattingToExistingStyles({
  heading1: {
    run: {
      font: "Arial",
      size: 24,
      bold: true,
      italic: false,
      underline: false,
      // Don't preserve - enforce consistency
      preserveBold: false,
      preserveItalic: false,
      preserveUnderline: false,
    },
  },
});
```

**Result:**

- ALL Heading1 text: Arial 24pt bold, no italic/underline
- Removes any user-added emphasis for consistency

---

## Common Migration Patterns

### Pattern 1: Simple Font/Size Change (Keep Emphasis)

```typescript
// OLD (doesn't work - creates undefined styles)
doc.applyCustomStylesToDocument();

// NEW (works - preserves user bold/italic)
doc.applyCustomFormattingToExistingStyles({
  normal: {
    run: {
      font: "Verdana",
      size: 12,
      preserveBold: true, // Keep user's bold
      preserveItalic: true, // Keep user's italic
      preserveUnderline: true, // Keep user's underline
    },
  },
});
```

### Pattern 2: Standardize Headings (Remove Emphasis)

```typescript
// Enforce consistent heading appearance
doc.applyCustomFormattingToExistingStyles({
  heading1: {
    run: {
      font: "Arial",
      size: 18,
      bold: true,
      italic: false,
      underline: false,
      // Don't preserve - remove all emphasis
      preserveBold: false,
      preserveItalic: false,
      preserveUnderline: false,
    },
  },
});
```

### Pattern 3: Heading2 with Table Wrapping

```typescript
// OLD METHOD wrapped in tables but couldn't customize
doc.applyCustomStylesToDocument(); // ❌ Fixed gray color

// NEW METHOD - fully customizable table appearance
doc.applyCustomFormattingToExistingStyles({
  heading2: {
    run: { font: "Arial", size: 14, bold: true },
    paragraph: { spacing: { before: 120, after: 120 } },
    tableOptions: {
      shading: "4472C4", // Blue background!
      marginLeft: 200, // Custom margins
      marginRight: 200,
      tableWidthPercent: 4500, // 90% width
    },
  },
});
```

### Pattern 4: Complete Document Styling

```typescript
doc.applyCustomFormattingToExistingStyles({
  heading1: {
    run: { font: "Arial", size: 20, bold: true, color: "1F4788" },
    paragraph: { spacing: { after: 240 } },
  },
  heading2: {
    run: { font: "Arial", size: 16, bold: true, color: "1F4788" },
    paragraph: { spacing: { before: 120, after: 120 } },
    tableOptions: { shading: "D9E2F3" },
  },
  heading3: {
    run: { font: "Arial", size: 14, bold: true },
    paragraph: { spacing: { before: 60, after: 60 } },
  },
  normal: {
    run: {
      font: "Calibri",
      size: 11,
      preserveBold: true,
      preserveItalic: true,
    },
    paragraph: {
      spacing: { after: 100 },
      alignment: "justify",
    },
  },
  listParagraph: {
    run: { font: "Calibri", size: 11, preserveBold: true },
    paragraph: { spacing: { before: 0, after: 60 } },
  },
});
```

---

## Technical Details

### How Preserve Flags Work

From [`Document.ts:3733-3826`](../../src/core/Document.ts:3733):

```typescript
// 1. SAVE formatting properties that should be preserved
const preservedFormatting = para.getRuns().map((run) => {
  const fmt = run.getFormatting();
  return {
    run: run,
    bold: normalPreserve.bold ? fmt.bold : undefined,
    italic: normalPreserve.italic ? fmt.italic : undefined,
    underline: normalPreserve.underline ? fmt.underline : undefined,
  };
});

// 2. CLEAR direct formatting that conflicts with style
para.clearDirectFormattingConflicts(normal);

// 3. RESTORE preserved properties after clearing
for (const saved of preservedFormatting) {
  if (saved.bold !== undefined) saved.run.setBold(saved.bold);
  if (saved.italic !== undefined) saved.run.setItalic(saved.italic);
  if (saved.underline !== undefined) saved.run.setUnderline(saved.underline);
}
```

This ensures:

- Style changes from [`styles.xml`](../../src/core/Document.ts:1392) take effect
- User's intentional emphasis is preserved
- No conflicts between direct formatting and styles

### ECMA-376 Compliance

Per **ECMA-376 Part 1 §17.7.2**: Direct formatting (in `document.xml`) **ALWAYS** overrides style definitions (in `styles.xml`).

The new method properly handles this by:

1. Clearing conflicting direct formatting with [`clearDirectFormattingConflicts()`](../../src/elements/Paragraph.ts:1)
2. Selectively restoring preserved properties
3. Ensuring style definitions control the formatting

---

## Migration Checklist

- [ ] Replace `applyCustomStylesToDocument()` calls
- [ ] Use `applyCustomFormattingToExistingStyles()` instead
- [ ] Configure preserve flags for body text styles (Normal, List Paragraph)
- [ ] Test document output in Microsoft Word
- [ ] Verify styles appear correctly in Word's Style Gallery
- [ ] Check that emphasis (bold/italic) is preserved as expected

---

## Questions?

- **Q: Will my existing documents break?**

  - A: No - this only affects how you apply styles during generation, not already-saved documents

- **Q: What if I want to remove ALL emphasis?**

  - A: Set `preserveBold: false`, `preserveItalic: false`, `preserveUnderline: false`

- **Q: Can I still use the old method?**

  - A: Yes until v4.0.0, but it won't work correctly (creates undefined styles)

- **Q: What about other styles (Heading4, Heading5, etc.)?**
  - A: Use [`updateStyle()`](../../src/core/Document.ts:1529) or directly modify with [`getStyle()`](../../src/core/Document.ts:1469)

---

## See Also

- [`applyCustomFormattingToExistingStyles()` documentation](../../src/core/Document.ts:3258)
- [`StyleConfig` interface](../../src/types/styleConfig.ts:109)
- [`ApplyCustomFormattingOptions` interface](../../src/types/styleConfig.ts:130)
- [Using Styles Guide](./using-styles.md)
