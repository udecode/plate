---
'@udecode/plate-markdown': minor
---

When serializing an incomplete MDX file, we encounter an error. To address this, the solution is to remove the remark mdx plugin causing the issue.

To make the remarkMdx plugin discoverable, we’ve introduced `tagRemarkPlugin`.

```tsx
    remarkPlugins: [
      remarkMath,
      remarkGfm,
      tagRemarkPlugin(remarkMdx, REMARK_MDX_TAG),
      remarkMention,
    ],
```

After that we can use the following code with `withoutMdx` option to solve this issue.

```tsx
try {
  const nodes = editor.getApi(MarkdownPlugin).markdown.deserialize(text);
  return nodes;
} catch (error) {
  const nodes = editor.getApi(MarkdownPlugin).markdown.deserialize(text, {
    withoutMdx: true,
  });
  return nodes;
}
```

The previous approach relied on using name for filtering, but this proved to be unreliable—name can be minified during the build process, making it inconsistent.
