---
"@platejs/basic-nodes": major
---

Store blockquotes as container blocks with block children.
Lift every selected nested quoted block one level on `Shift+Tab`.
Reset headings to paragraphs on `Backspace` at block start before any merge.

**Migration:**

1. Update persisted values, fixtures, and tests to use block children instead of direct text children.
2. Expect `editor.tf.blockquote.toggle()` to wrap or unwrap blocks instead of retagging one text block in place.
3. Empty later quoted paragraphs delete in place on `Backspace` instead of jumping out of the quote.
4. `Backspace` at the start of a heading now resets the heading to a paragraph before any merge.
5. Legacy flat blockquote values still normalize on load, but persisted snapshots and fixtures should move to the new shape.

```tsx
// Before
{ type: 'blockquote', children: [{ text: 'Quote' }] }

// After
{
  type: 'blockquote',
  children: [{ type: 'p', children: [{ text: 'Quote' }] }],
}
```
