---
'@udecode/plate-markdown': major
---
#### New Features

- Added support for math type deserialization
- Added default underline mark serialization as `<u>underline</u>`
- Improved serialization process:
  - Now uses a two-step process: `slate nodes => MDAST nodes => markdown string`
  - Previously: direct conversion from Slate nodes to markdown string
  - Results in more reliable and robust serialization
- New node filtering options:
  - `allowedNodes`: Whitelist specific nodes
  - `disallowedNodes`: Blacklist specific nodes
  - `allowNode`: Custom function to filter nodes
- New `rules` option for customizing serialization and deserialization rules, including **custom mdx** support
- New `remarkPlugins` option to use [remark plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins)

#### Breaking Changes

##### Deserialization

- Removed `elementRules` and `textRules` options
  - Use `rules.key.deserialize` instead
  - See [nodes documentation](https://platejs.org/docs/markdown)

Example migration:

```tsx
export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    disallowedNodes: [SuggestionPlugin.key],
    rules: {
      // For textRules
      [BoldPlugin.key]: {
        deserialize: (mdastNode) => ({
          bold: true,
          text: node.value || '',
        }),
      },
      // For elementRules
      [EquationPlugin.key]: {
        deserialize: (mdastNode, options) => ({
          children: [{ text: '' }],
          texExpression: node.value,
          type: EquationPlugin.key,
        }),
      },
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
```

- Removed processor in `editor.api.markdown.deserialize`
  - Use `remarkPlugins` instead

##### Serialization

- Removed `serializeMdNodes`
  - Use `editor.markdown.serialize({ value: nodes })` instead
- Removed `SerializeMdOptions` due to new serialization process
  - Previous process: `slate nodes => md`
  - New process: `slate nodes => md-ast => md`
- Removed options:
  - `nodes`
  - `breakTag`
  - `customNodes`
  - `ignoreParagraphNewline`
  - `listDepth`
  - `markFormats`
  - `ulListStyleTypes`
  - `ignoreSuggestionType`

Migration example for `SerializeMdOptions.customNodes` and `SerializeMdOptions.nodes`:

```tsx
export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    rules: {
      // Ignore all `insert` type suggestions
      [SuggestionPlugin.key]: {
        serialize: (slateNode: TSuggestionText, options): mdast.Text => {
          const suggestionData = options.editor
            .getApi(SuggestionPlugin)
            .suggestion.suggestionData(node);

          return suggestionData?.type === 'insert'
            ? { type: 'text', value: '' }
            : { type: 'text', value: node.text };
        },
      },
      // For elementRules
      [EquationPlugin.key]: {
        serialize: (slateNode) => ({
          type: 'math',
          value: node.texExpression,
        }),
      },
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
```
