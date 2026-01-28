# Comment Range Highlighting Implementation

## Overview

This implementation adds the ability to highlight specific text ranges in paragraphs when a comment is selected, based on the `commentRangeStart` and `commentRangeEnd` markers in Word documents.

## Architecture

### Data Flow

```
Word Document (DOCX)
    ↓
commentRangeStart/End markers parsed
    ↓
Range data stored in DocumentComment.ranges[]
    ↓
CommentDetails component retrieves comment
    ↓
Highlighting applied to paragraph HTML
    ↓
User sees highlighted text ranges
```

### Key Components

#### 1. Type Definitions (`src/types.ts`)

```typescript
export interface CommentRange {
  paragraphIndex: number;    // Index in document order
  startSpanIndex: number;    // Inclusive start (0-based)
  endSpanIndex: number;      // Exclusive end
}

export interface DocumentComment {
  // ... existing fields
  ranges?: CommentRange[];   // Array of highlighted ranges
}
```

#### 2. Document Transformation (`src/utils/docxHtmlTransformer.ts`)

The `transformParagraph` function has been enhanced to:

- Scan for `commentRangeStart` and `commentRangeEnd` elements
- Track the position of these markers relative to run elements (spans)
- Store range information in the transform context
- Return ranges in the `TransformedContent` structure

Key behavior:
- Ranges are tracked at span boundaries (outside run elements)
- Numbering spans are excluded from the count
- Each range records: paragraph index, start span index, end span index

#### 3. Highlighting Utility (`src/utils/commentHighlighting.ts`)

Two main functions:

**`applyCommentHighlighting(paragraphs, ranges)`**
- Takes an array of paragraph HTML strings
- Wraps specified span ranges in `<mark class="comment-highlight">` elements
- Uses DOM manipulation to ensure proper nesting
- Returns modified paragraph array

**`extractAndHighlightParagraphs(paragraphs, indices, ranges)`**
- Convenience function that extracts specific paragraphs AND applies highlighting
- Adjusts range indices to match extracted paragraphs
- Used by CommentDetails component

#### 4. CommentDetails Component (`src/components/CommentDetails.tsx`)

Updated to conditionally apply highlighting:

```tsx
dangerouslySetInnerHTML={{ 
  __html: comment.ranges && comment.ranges.length > 0
    ? extractAndHighlightParagraphs(documentParagraphs, comment.paragraphIds, comment.ranges)
    : extractParagraphsByIndex(documentParagraphs, comment.paragraphIds)
}}
```

#### 5. Styling (`src/index.css`)

```css
.comment-highlight {
  background-color: rgba(255, 235, 59, 0.3);
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.comment-highlight:hover {
  background-color: rgba(255, 235, 59, 0.45);
}
```

## Usage

### For Users

1. Upload a Word document with comments that have text ranges
2. Select a comment from the comment list
3. The right panel shows the comment details
4. Referenced paragraphs are displayed with highlighted text ranges
5. Hover over highlights to see a slightly stronger highlight

### For Developers

#### Accessing Range Data

```typescript
// Get a comment with ranges
const comment = comments.find(c => c.id === selectedId);

if (comment.ranges) {
  comment.ranges.forEach(range => {
    console.log(`Para ${range.paragraphIndex}: spans ${range.startSpanIndex}-${range.endSpanIndex}`);
  });
}
```

#### Applying Highlighting Manually

```typescript
import { applyCommentHighlighting } from './utils/commentHighlighting';

const highlightedParagraphs = applyCommentHighlighting(
  paragraphsArray,
  commentRanges
);
```

## Limitations

### Current Design Constraints

1. **Paragraph-Level Ranges**: Ranges are tracked within individual paragraphs. A `commentRangeStart` in one paragraph and `commentRangeEnd` in another are not currently linked as a single range.

2. **Span Boundaries**: Highlighting occurs at span (run) boundaries. You cannot highlight part of a single span.

3. **No Nested Highlighting**: Multiple overlapping ranges are supported, but the visual rendering doesn't distinguish between overlaps.

### Known Issues

- Multi-paragraph ranges where start and end markers are in different paragraphs are not fully supported
- The visual design doesn't support nested/layered highlights for overlapping comments

### Future Enhancements

Potential improvements for future iterations:

1. **Multi-Paragraph Range Support**: Track and highlight ranges that span multiple paragraphs
2. **Character-Level Precision**: Support highlighting within a span (requires more complex DOM manipulation)
3. **Nested Highlight Visualization**: Different colors or indicators for overlapping comment ranges
4. **Interactive Highlights**: Click on a highlight to focus/select the associated comment
5. **Highlight Colors**: Different colors for different comment authors or types
6. **Range Editing**: UI for manually adjusting comment ranges

## Testing

### Test Coverage

- **12 tests** in `commentHighlighting.test.ts`: Unit tests for highlighting utility
- **17 tests** in `docxParser.test.ts`: Including comment range parsing
- **6 tests** in `commentRangeIntegration.test.ts`: End-to-end integration tests
- **Total: 274 tests passing**

### Key Test Scenarios

1. Single span highlighting
2. Multiple consecutive spans
3. Multiple ranges in different paragraphs
4. Preserving existing span styles
5. Skipping numbering spans
6. Invalid range handling
7. Empty paragraphs
8. Overlapping ranges

## Technical Notes

### DOM Manipulation

The highlighting implementation uses the browser's DOMParser to manipulate HTML safely:

```typescript
const parser = new DOMParser();
const doc = parser.parseFromString(paragraphHtml, 'text/html');
// ... manipulate DOM
return paragraph.outerHTML;
```

This approach:
- Avoids string concatenation errors
- Preserves existing HTML structure
- Safely handles special characters
- Maintains proper element nesting

### Performance

- Highlighting is applied on-demand when displaying a comment
- No re-rendering of non-highlighted paragraphs
- Efficient DOM manipulation using native browser APIs
- Caching not needed as operation is fast

### Browser Compatibility

The implementation uses standard Web APIs:
- DOMParser (widely supported)
- Element.classList (modern browsers)
- Array methods (ES6+)

## Examples

### Example 1: Simple Range

**Word Document:**
```
"This is [highlighted text] and this is not."
       ^                    ^
    start                  end
```

**Result:**
```typescript
{
  paragraphIndex: 0,
  startSpanIndex: 1,
  endSpanIndex: 3
}
```

### Example 2: Multiple Ranges

**Word Document:**
```
Paragraph 1: [First range]
Paragraph 2: [Second range] and [third range]
```

**Result:**
```typescript
[
  { paragraphIndex: 0, startSpanIndex: 0, endSpanIndex: 1 },
  { paragraphIndex: 1, startSpanIndex: 0, endSpanIndex: 1 },
  { paragraphIndex: 1, startSpanIndex: 2, endSpanIndex: 3 }
]
```

## Troubleshooting

### Highlights Not Showing

1. Check if comment has `ranges` property
2. Verify `paragraphIds` matches `ranges[].paragraphIndex`
3. Ensure spans exist at the specified indices
4. Check browser console for errors

### Incorrect Highlighting

1. Verify commentRangeStart/End markers in Word document
2. Check span counting (numbering spans are excluded)
3. Test with simpler document structure
4. Review test cases for similar scenarios

### Style Issues

1. Check CSS is loaded (`.comment-highlight` class)
2. Verify no CSS conflicts with other styles
3. Test in different browsers
4. Check if custom styles override defaults

## Contributing

When modifying this feature:

1. Run all tests: `npm run test:run`
2. Check linting: `npm run lint`
3. Update documentation for behavior changes
4. Add tests for new functionality
5. Consider backward compatibility

## References

- [WordML Comment Range Elements](https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.commentrangestart)
- [DOM Manipulation Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- Issue: #70c81910-f177-488f-b314-0f7755b67311
