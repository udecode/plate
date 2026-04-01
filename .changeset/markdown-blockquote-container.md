---
"@platejs/markdown": major
---

Deserialize and serialize blockquotes as container blocks with nested content

**Migration:**

1. Update deserializer snapshots and fixtures to expect `blockquote.children` to contain block nodes such as paragraphs and lists.
2. If you compare editor values directly, stop asserting on newline-packed quote text and assert on nested block structure instead.
3. If you generate initial editor values from markdown-derived content, hydrate blockquotes with paragraph children.

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

Quoted lists now survive round-trip instead of being flattened:

```tsx
// Before
> Quote
> - aaa
> - bbb

// could deserialize to
{
  type: 'blockquote',
  children: [{ text: 'Quote\\naaa\\nbbb' }],
}

// After
{
  type: 'blockquote',
  children: [
    { type: 'p', children: [{ text: 'Quote' }] },
    { type: 'ul', children: [/* list items */] },
  ],
}
```
