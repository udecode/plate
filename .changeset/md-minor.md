---
'@udecode/plate-serializer-md': minor
---

- Fixes #2716
- Fixes #2858
- Add default support for indent lists.
- Improved new lines around heading.
- Trim new lines.
- Add `serializeMdNodes`: serialize nodes to markdown without editor.
- Add options enabling much more control over the serialization:

```ts
type SerializeMdNodeOptions = {
  /**
   * Whether the node is enabled. If false, the node will be considered as
   * paragraph.
   */
  enabled?: boolean;

  isLeaf?: boolean;

  /**
   * Whether the node is void. Required for empty void nodes to not be skipped.
   * Default is true for `hr` and `img` nodes
   */
  isVoid?: boolean;

  /** Serialize node to markdown. */
  serialize?: (
    children: string,
    node: MdNodeType,
    opts: SerializeMdOptions
  ) => string;

  /** Whether the node should be skipped (serialized to empty string). */
  skip?: boolean;

  /** The type of the node. */
  type: string;
};
/** @default Options for each node type. */
{
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
}
```

- Remove plugin dependencies.
- Remove `nodeTypes` option in favor of `nodes`.
