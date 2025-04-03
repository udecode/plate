---
'@udecode/plate-markdown': major
---

## NEW:

- Deserialization supports the math type.
- Serialization now support the mark `underline` by default it will convert as `<u>underline</u>`.
- Better serialization: Previously, Slate nodes were directly parsed into an markdown string.Now, Slate nodes are first parsed into MDAST nodes and then converted into an markdown string, making the process more reliable and robust.
- New options `allowedNodes`, `disallowedNodes`, and `allowNode` help you filter out unwanted nodes.
- New option `nodes` used for customizing serialization , deserialization and **custom mdx** rules.
- New option `remarkPlugins` list of [remark plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins) to use

## Breaking Change:

#### deserialize:

Remove `elementRules` and `textRules` options use `nodes.key.deserialize` instead

See more about [nodes](https://platejs.org/docs/markdown) option

For example:

```tsx
export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    disallowedNodes: [SuggestionPlugin.key],
    nodes: {
      //For textRules
      [BoldPlugin.key]: {
        deserialize: (mdastNode) => {
          return {
            bold: true,
            text: node.value || '',
          };
        },
      },
      // For elementRules
      [EquationPlugin.key]: {
        deserialize: (mdastNode, options) => {
          return {
            children: [{ text: '' }],
            texExpression: node.value,
            type: EquationPlugin.key,
          };
        },
      },
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
```

Remove processor in `editor.api.markdown.deserialize` use `remarkPlugins` instead

---

### serialize:

`SerializeMdOptions` has been removed because the serialization process has changed from `slate nodes => md` to `slate nodes => md-ast => md`, making many of the previous concepts obsolete. The following options are no longer available:
Before:

```tsx
interface SerializeMdOptions {
  /** @default Options for each node type. */
  nodes: Record<keyof MdNodeTypes, SerializeMdNodeOptions>;
  /**
   * Tag to use for line breaks.
   *
   * @default '<br>'
   */
  breakTag?: string;
  /** Custom nodes to serialize. */
  customNodes?: Record<string, SerializeMdNodeOptions>;
  ignoreParagraphNewline?: boolean;
  listDepth?: number;
  /**
   * Format for underline.
   *
   * @example
   *   {
   *     "underline": ["<u>", "</u>"]
   *   }
   */
  markFormats?: Partial<MarkFormats>;
  /**
   * List of unordered list style types (when using indent list).
   *
   * @default ['disc', 'circle', 'square']
   */
  ulListStyleTypes?: string[];
  /** @default 'insert' */
  ignoreSuggestionType?: 'insert' | 'remove' | 'update';
}
```

- `SerializeMdOptions.customNodes` and `SerializeMdOptions.nodes` - These can be replaced with the `nodes.key.serialize` option in the plugin configuration. For example:

```tsx
export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    disallowedNodes: [],
    nodes: {
      // ignore all `insert` type suggestionÏ
      [SuggestionPlugin.key]: {
        serialize: (slateNode: TSuggestionText, options): mdast.Text => {
          const suggestionData = options.editor
            .getApi(SuggestionPlugin)
            .suggestion.suggestionData(node);

          if (suggestionData?.type === 'insert')
            return {
              type: 'text',
              value: '',
            };

          return {
            type: 'text',
            value: node.text,
          };
        },
      },
      // For elementRules
      [EquationPlugin.key]: {
        serialize: (slateNode) => {
          return {
            type: 'math',
            value: node.texExpression,
          };
        },
      },
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
```
