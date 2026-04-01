---
"@platejs/basic-nodes": major
---

Wrap `blockquote` blocks instead of converting them into flat text blocks

**Migration:**

1. Update seeded blockquote values, fixtures, and tests to use block children instead of direct text children.
2. Expect `editor.tf.blockquote.toggle()` to wrap and unwrap blocks instead of converting one text block in place.
3. Stop relying on `BlockquotePlugin` text-block `break` rules such as `default: 'lineBreak'`; blockquote now delegates Enter behavior to its inner blocks.
4. Legacy flat blockquote values loaded into an editor with `BlockquotePlugin` normalize to paragraph children automatically, but persisted snapshots and fixtures should still be updated to the new shape.

```tsx
// Before
{ type: 'blockquote', children: [{ text: 'Quote' }] }

// After
{
  type: 'blockquote',
  children: [{ type: 'p', children: [{ text: 'Quote' }] }],
}
```

If you serialize or hydrate editor values manually, treat blockquote like other container elements:

```tsx
// Before
editor.tf.blockquote.toggle();

// selection inside one paragraph
// => paragraph became { type: 'blockquote', children: [{ text: ... }] }

// After
editor.tf.blockquote.toggle();

// selection inside one paragraph
// => paragraph is wrapped by { type: 'blockquote', children: [{ type: 'p', ... }] }
```
