---
'platejs': patch
---

- Serialize an image, heading, code block, blockquote or details with list properties inside the `<li>` of its `<ol>` or `<ul>`, and parse it back as that block with its list properties; a pasted `<li>` holding one block that can be listed, such as `<ul><li><img src="…"></li></ul>`, becomes a list item of that block
- Report each attribute Plate's HTML mappings write that no installed mapping claims, such as `data-text-indent` in an editor without text indent, as an `html-unsupported-content` warning with `kind: 'attribute'` and `source.attribute`, under every loss policy; other markup and custom mappings' own attributes are not reported
- Claim the attributes a custom HTML `decode` result represents with `preserve(...names)`:

```ts
decode: ({ element, preserve }) => {
  const indent = Number(element.dataset.indent);

  if (!indent) return undefined;
  preserve('data-indent');

  return indent;
},
```

- Write a `createsElement` HTML mapping's output around the HTML of every target other than the default block, and put its decoded properties on the one block a matched element holds when that block can carry them
