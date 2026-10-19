---
'platejs': patch
---

- Report every content property HTML serialization does not represent: each one reports its own `html-unsupported-content` warning with `kind: 'attribute'` and `model.property`, under every loss policy, and clipboard copy writes `text/html` only when nothing is lost
- Claim the properties an HTML element encoder writes with `preserve(...keys)`, typed to the mapping target's own properties; a mark or property mapping claims its value by returning output that writes it

```ts
encode: ({ content, node, preserve }) => {
  preserve('variant');

  return {
    attributes: { 'data-variant': node.variant },
    children: content,
    tag: 'aside',
  };
},
```

- Export and read back image `title`, and the `provider` and `sourceUrl` of videos and media embeds
- Read a pixel width on an image, audio, video or media embed back as a number (`640px` → `640`); other lengths, such as `50%`, stay strings
