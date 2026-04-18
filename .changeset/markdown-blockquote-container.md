---
"@platejs/markdown": major
---

Round-trip blockquotes as nested block content instead of flat newline-packed text.
Serialize image titles from `node.title` instead of copying the caption into the markdown title slot.
Preserve MDX media attribute expressions during markdown serialization instead of stringifying them into JSON text.
Serialize plain URL links back to bare URL markdown instead of bracket-link form.
Round-trip footnote references and definitions as dedicated footnote nodes instead of collapsing them to plain-text fallback.

**Migration:**

1. Update snapshots and direct value assertions to expect `blockquote.children` to contain block nodes such as paragraphs and lists.
2. If you generate initial editor values from markdown, hydrate blockquotes with paragraph children instead of flat text.
3. If you want markdown output like `![alt](url "title")`, set `node.title`. Images without a title now serialize as `![alt](url)`.
4. If you serialize MDX media nodes with expression attributes like `width={640}`, expect those expressions to stay as expressions instead of turning into quoted JSON.
5. Plain URL links such as `https://platejs.org` now serialize as bare URLs instead of `[https://platejs.org](https://platejs.org)`.
6. If you enable footnote-aware markdown input, install `@platejs/footnote` and include `BaseFootnoteReferencePlugin` and `BaseFootnoteDefinitionPlugin` so footnote nodes have real editor semantics instead of falling back to unknown node types.

```tsx
// Before
{ type: 'blockquote', children: [{ text: 'Quote\\nNext line' }] }

// After
{
  type: 'blockquote',
  children: [
    { type: 'p', children: [{ text: 'Quote' }] },
    { type: 'p', children: [{ text: 'Next line' }] },
  ],
}
```
