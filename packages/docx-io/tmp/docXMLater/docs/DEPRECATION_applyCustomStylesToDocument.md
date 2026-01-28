# Deprecation Plan: `applyCustomStylesToDocument()`

## Status: **DEPRECATED** as of v3.6.0

**Removal Target:** v4.0.0

---

## Summary

[`applyCustomStylesToDocument()`](../src/core/Document.ts:3113) is fundamentally flawed and should be deprecated immediately in favor of [`applyCustomFormattingToExistingStyles()`](../src/core/Document.ts:3311).

---

## Critical Issues

### 1. Creates Undefined Styles

**Problem:**

```typescript
// Line 3130
para.setStyle("CustomHeader1"); // ← Style doesn't exist!
```

The method sets paragraph style references to `CustomHeader1`, `CustomHeader2`, etc., but **NEVER creates these style definitions** in the StylesManager or [`styles.xml`](../src/core/Document.ts:1392).

**Result:**

- Paragraphs reference non-existent styles
- Word falls back to "Normal" style
- All custom formatting is lost

### 2. Doesn't Update Style Definitions

**Problem:**
The method only changes `paragraph.setStyle()` references but never calls:

- `stylesManager.addStyle()`
- `style.setRunFormatting()`
- `style.setParagraphFormatting()`

**Result:**

- No changes to [`styles.xml`](../src/core/Document.ts:1392)
- Formatting doesn't apply
- Breaks ECMA-376 document structure

### 3. No Customization

**Problem:**

- Hardcoded to 3 styles only (Heading1, Heading2, Normal)
- Fixed formatting (cannot change font, size, colors)
- Fixed table appearance for Heading2
- Cannot preserve user emphasis (bold/italic/underline)

---

## Replacement Method

Use [`applyCustomFormattingToExistingStyles()`](../src/core/Document.ts:3311) instead.

### Key Advantages

✅ **Updates actual style definitions** in [`styles.xml`](../src/core/Document.ts:1392)
✅ **Clears direct formatting conflicts** per ECMA-376 §17.7.2
✅ **Fully customizable** - configure all properties
✅ **Preserves user emphasis** - selectively keep bold/italic/underline
✅ **Supports 5 styles** - Heading1-3, Normal, List Paragraph
✅ **ECMA-376 compliant** - proper structure and precedence

---

## Migration Examples

### Simple Migration

**Before (DEPRECATED):**

```typescript
const counts = doc.applyCustomStylesToDocument();
```

**After (CORRECT):**

```typescript
// Use defaults (Verdana fonts)
doc.applyCustomFormattingToExistingStyles();

// Or customize
doc.applyCustomFormattingToExistingStyles({
  heading1: {
    run: { font: "Verdana", size: 18, bold: true },
    paragraph: { spacing: { after: 240 } },
  },
  heading2: {
    run: { font: "Verdana", size: 14, bold: true },
    tableOptions: { shading: "BFBFBF", marginLeft: 115 },
  },
  normal: {
    run: {
      font: "Verdana",
      size: 12,
      preserveBold: true, // Keep user's bold
      preserveItalic: true, // Keep user's italic
    },
    paragraph: { spacing: { before: 60, after: 60 } },
  },
});
```

### Preserving User Emphasis

**The Problem:** Users often bold or underline important words. Old method would remove this.

**The Solution:** Use preserve flags

```typescript
doc.applyCustomFormattingToExistingStyles({
  normal: {
    run: {
      font: "Arial",
      size: 11,
      color: "000000",
      // Preserve user's intentional emphasis
      preserveBold: true,
      preserveItalic: true,
      preserveUnderline: true,
    },
  },
});
```

**Result:**

- Font → Arial 11pt (from style)
- User's **bold** words stay bold ✅
- User's _italic_ words stay italic ✅
- User's <u>underlined</u> words stay underlined ✅

---

## Implementation Pattern

### The Save → Clear → Restore Pattern

From [`Document.ts:3733-3756`](../src/core/Document.ts:3733):

```typescript
// 1. SAVE formatting BEFORE clearing
const preservedFormatting = para.getRuns().map((run) => {
  const fmt = run.getFormatting();
  return {
    run: run,
    bold: normalPreserve.bold ? fmt.bold : undefined,
    italic: normalPreserve.italic ? fmt.italic : undefined,
    underline: normalPreserve.underline ? fmt.underline : undefined,
  };
});

// 2. CLEAR conflicts (direct formatting overrides styles per ECMA-376)
para.clearDirectFormattingConflicts(normal);

// 3. RESTORE preserved properties
for (const saved of preservedFormatting) {
  if (saved.bold !== undefined) saved.run.setBold(saved.bold);
  if (saved.italic !== undefined) saved.run.setItalic(saved.italic);
  if (saved.underline !== undefined) saved.run.setUnderline(saved.underline);
}
```

This ensures:

- Style changes from [`styles.xml`](../src/core/Document.ts:1392) take effect
- User's intentional emphasis is preserved
- ECMA-376 compliant (no formatting precedence conflicts)

---

## Deprecation Implementation

### Add to Method (Line 3103-3112)

````typescript
/**
 * @deprecated Since v3.6.0 - Use {@link applyCustomFormattingToExistingStyles} instead
 *
 * **This method is fundamentally broken and will be removed in v4.0.0**
 *
 * **Critical Issues:**
 * - Creates undefined style IDs (CustomHeader1, CustomHeader2) that don't exist in styles.xml
 * - Doesn't modify actual style definitions - changes won't apply in Word
 * - No customization options - hardcoded formatting only
 * - Cannot preserve user emphasis (bold/italic/underline)
 * - Breaks ECMA-376 compliance
 *
 * **Migration:**
 * ```typescript
 * // OLD (broken - don't use)
 * doc.applyCustomStylesToDocument();
 *
 * // NEW (works correctly)
 * doc.applyCustomFormattingToExistingStyles({
 *   heading1: {
 *     run: { font: 'Verdana', size: 18, bold: true },
 *     paragraph: { spacing: { after: 240 } }
 *   },
 *   heading2: {
 *     run: { font: 'Verdana', size: 14, bold: true },
 *     tableOptions: { shading: 'BFBFBF' }
 *   },
 *   normal: {
 *     run: {
 *       font: 'Verdana',
 *       size: 12,
 *       preserveBold: true,      // Keep user's bold
 *       preserveItalic: true     // Keep user's italic
 *     }
 *   }
 * });
 * ```
 *
 * @see {@link applyCustomFormattingToExistingStyles} for the replacement method
 * @see [Migration Guide](../docs/guides/style-application-migration.md)
 *
 * Creates and applies custom styles to the document
 * ⚠️ WARNING: This method creates undefined styles and doesn't work correctly
 */
````

### Add Runtime Warning (Line 3118 - First Line of Method)

```typescript
public applyCustomStylesToDocument(): {
  heading1: number;
  heading2: number;
  normal: number;
} {
  // DEPRECATION WARNING
  this.logger.warn(
    'applyCustomStylesToDocument() is DEPRECATED and will be removed in v4.0.0. ' +
    'Use applyCustomFormattingToExistingStyles() instead. ' +
    'This method creates undefined styles and may not work correctly. ' +
    'See: docs/guides/style-application-migration.md'
  );

  const counts = { heading1: 0, heading2: 0, normal: 0 };
  // ... rest of implementation
```

---

## Timeline

| Version    | Action                                |
| ---------- | ------------------------------------- |
| **v3.6.0** | Add deprecation warning + JSDoc tag   |
| **v3.7.0** | Update all examples to use new method |
| **v3.8.0** | Add migration guide to documentation  |
| **v3.9.0** | Final deprecation notice              |
| **v4.0.0** | **REMOVE METHOD**                     |

---

## Testing Strategy

### Before Deprecation

- [x] Verify no examples use `applyCustomStylesToDocument()` ✅
- [x] Verify no tests use `applyCustomStylesToDocument()` ✅
- [ ] Add integration test comparing old vs new methods
- [ ] Document behavior differences

### After Deprecation (v3.6.0)

- [ ] Monitor user feedback/issues
- [ ] Provide migration assistance
- [ ] Update Stack Overflow answers
- [ ] Update blog posts/tutorials

---

## Rollout Plan

### Phase 1: Deprecation (v3.6.0)

1. Add `@deprecated` JSDoc tag to method
2. Add runtime warning on first call
3. Create migration guide ([`docs/guides/style-application-migration.md`](../guides/style-application-migration.md))
4. Update CHANGELOG with deprecation notice

### Phase 2: Documentation (v3.7.0)

1. Update README with deprecation notice
2. Add migration examples
3. Update API documentation
4. Post announcement

### Phase 3: Final Warning (v3.9.0)

<content truncated - exceeds max length>

## Backup Strategy

If users absolutely need the old behavior:

1. Copy method code before removal
2. Provide as standalone utility function
3. Mark as "community-maintained" (not officially supported)

---

## Questions & Answers

**Q: Will this break existing code?**

- A: Method still works but creates broken style references. Users should migrate ASAP.

**Q: What about documents already using `CustomHeader1`?**

- A: They're broken - styles don't exist. Need to use new method and resave.

**Q: Can we auto-migrate on document load?**

- A: Not safely - we don't know user's intended formatting.

**Q: Why not fix the old method instead?**

- A: Would change behavior drastically. Better to use properly-designed new method.

---

## Contact

For migration assistance, open an issue on GitHub with the "deprecation-help" label.
