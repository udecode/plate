---
slug: /serializing-md
title: Markdown
---

## Serializer

Use [remark-slate](https://github.com/hanford/remark-slate).

## Deserializer

```ts live
() => {
  const plugins = [
    ...pluginsBasic,
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createTablePlugin(),
    createDeserializeMDPlugin(),
  ];

  return (
    <SlatePlugins
      id="deserialize-md"
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValuePasteMd}
    />
  );
}
```