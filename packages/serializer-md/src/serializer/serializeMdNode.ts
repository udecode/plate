import type {
  MdElementType,
  MdLeafType,
  MdNodeType,
  MdNodeTypes,
} from './types';

type MarkFormats = Record<
  | 'bold'
  | 'boldItalic'
  | 'boldItalicStrikethrough'
  | 'code'
  | 'italic'
  | 'strikethrough'
  | 'underline',
  null | string | string[]
>;

export type SerializeMdNodeOptions = {
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

export interface SerializeMdOptions {
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

const isLeafNode = (node: MdElementType | MdLeafType): node is MdLeafType => {
  return typeof (node as MdLeafType).text === 'string';
};

export function serializeMdNode(
  node: MdElementType | MdLeafType,
  opts: SerializeMdOptions
) {
  const { customNodes, nodes } = opts;
  opts.breakTag = opts.breakTag ?? '<br>';
  opts.ignoreParagraphNewline = opts.ignoreParagraphNewline ?? false;
  opts.listDepth = opts.listDepth ?? 0;
  opts.ulListStyleTypes = opts.ulListStyleTypes ?? ['disc', 'circle', 'square'];

  const markFormats = {
    bold: '**',
    boldItalic: '***',
    boldItalicStrikethrough: '~~***',
    code: '`',
    italic: '_',
    strikethrough: '~~',
    underline: null,
    ...opts.markFormats,
  };

  const elOptions = isLeafNode(node)
    ? undefined
    : Object.values({ ...nodes, ...customNodes }).find((n) => {
        return n.type === node.type;
      });

  const text = (node as MdLeafType).text || '';
  let type = (node as MdElementType).type || '';

  let children = text;

  if (elOptions?.skip) {
    return '';
  }
  // Serialize children
  if (!isLeafNode(node)) {
    children = node.children
      .map((c: MdElementType | MdLeafType, index, all) => {
        let ignoreParagraphNewlineProp = opts.ignoreParagraphNewline;
        let listDepth = opts.listDepth ?? 0;
        const listProps: any = {};

        const isIndentList = isLeafNode(c) ? false : !!c.listStyleType;

        if (isIndentList) {
          ignoreParagraphNewlineProp = true;
          listProps.isList = true;
        } else {
          const LIST_TYPES = [nodes.ul.type, nodes.ol.type];

          const isList = isLeafNode(c)
            ? false
            : (LIST_TYPES as string[]).includes(c.type || '');

          const selfIsList = (LIST_TYPES as string[]).includes(node.type || '');

          if (isList || selfIsList) {
            listProps.index = index;
            listProps.isList = true;
            listProps.length = all.length;
          }

          ignoreParagraphNewlineProp =
            ignoreParagraphNewlineProp || isList || selfIsList;

          // WOAH.
          // what we're doing here is pretty tricky, it relates to the block below where
          // we check for ignoreParagraphNewline and set type to paragraph.
          // We want to strip out empty paragraphs sometimes, but other times we don't.
          // If we're the descendant of a list, we know we don't want a bunch
          // of whitespace. If we're parallel to a link we also don't want
          // track depth of nested lists so we can add proper spacing
          listDepth = (LIST_TYPES as string[]).includes(
            (c as MdElementType).type || ''
          )
            ? listDepth + 1
            : listDepth;
        }
        /**
         * Check inline elements Links can have the following shape In which
         * case we don't want to surround with break tags
         *
         * @example
         *   { type: 'paragraph', children: [   { text: '' },   { type: 'link', children: [{ text: foo.com }]}   { text: '' } ]}
         */
        if (!isLeafNode(node) && Array.isArray(node.children)) {
          ignoreParagraphNewlineProp = true;
        }

        return serializeMdNode(
          {
            ...c,
            parent: {
              type,
              ...listProps,
            },
          },
          {
            ...opts,
            // to respect neighboring paragraphs
            ignoreParagraphNewline:
              ignoreParagraphNewlineProp &&
              // if we have c.break, never ignore empty paragraph new line
              !(c as MdElementType).break,
            listDepth,
          }
        );
      })
      .join('');
  }
  // This is pretty fragile code, check the long comment where we iterate over children
  if (
    !opts.ignoreParagraphNewline &&
    (text === '' || text === '\n') &&
    node.parent?.type === nodes.p.type &&
    !node.parent?.isList
  ) {
    type = nodes.p.type!;
    children = opts.breakTag;
  }
  // Skip nodes that are empty, not a list and not void.
  if (children === '' && !node.parent?.isList && !elOptions?.isVoid) {
    return;
  }
  if (isLeafNode(node)) {
    // Never allow decorating break tags with rich text formatting,
    // this can malform generated markdown
    // Also ensure we're only ever applying text formatting to leaf node
    // level chunks, otherwise we can end up in a situation where
    // we try applying formatting like to a node like this:
    // "Text foo bar **baz**" resulting in "**Text foo bar **baz****"
    // which is invalid markup and can mess everything up
    if (children !== opts.breakTag) {
      const leaf = node as any;

      if (
        markFormats.boldItalicStrikethrough &&
        leaf[nodes.strikethrough.type] &&
        leaf[nodes.bold.type] &&
        leaf[nodes.italic.type]
      ) {
        children = retainWhitespaceAndFormat(
          children,
          markFormats.boldItalicStrikethrough
        );
      } else if (
        markFormats.boldItalic &&
        leaf[nodes.bold.type] &&
        leaf[nodes.italic.type]
      ) {
        children = retainWhitespaceAndFormat(children, markFormats.boldItalic);
      } else {
        if (markFormats.underline && leaf[nodes.underline.type]) {
          children = retainWhitespaceAndFormat(children, markFormats.underline);
        }
        if (markFormats.bold && leaf[nodes.bold.type]) {
          children = retainWhitespaceAndFormat(children, markFormats.bold);
        }
        if (markFormats.italic && leaf[nodes.italic.type]) {
          children = retainWhitespaceAndFormat(children, markFormats.italic);
        }
        if (markFormats.strikethrough && leaf[nodes.strikethrough.type]) {
          children = retainWhitespaceAndFormat(
            children,
            markFormats.strikethrough
          );
        }
        if (markFormats.code && leaf[nodes.code.type]) {
          children = retainWhitespaceAndFormat(children, markFormats.code);
        }

        const leafOptions = Object.values({ ...nodes, ...customNodes }).find(
          (n) => {
            return leaf[n.type];
          }
        );

        if (leafOptions?.serialize) {
          children = leafOptions.serialize(children, leaf, opts);
        }
      }
    }

    return children;
  }
  if (elOptions?.enabled === false) {
    return children;
  }

  return elOptions?.serialize?.(children, node as any, opts) ?? children;
}

// This function handles the case of a string like this: "   foo   "
// Where it would be invalid markdown to generate this: "**   foo   **"
// We instead, want to trim the whitespace out, apply formatting, and then
// bring the whitespace back. So our returned string looks like this: "   **foo**   "
export function retainWhitespaceAndFormat(
  string: string,
  format: string | string[]
) {
  const formats = Array.isArray(format) ? format : [format];
  const start = formats[0];
  const end = formats[1] ?? reverseStr(formats[0]);

  // we keep this for a comparison later
  const frozenString = string.trim();

  // children will be mutated
  const children = frozenString;

  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const fullFormat = `${start}${children}${end}`;

  // This conditions accounts for no whitespace in our string
  // if we don't have any, we can return early.
  if (children.length === string.length) {
    return fullFormat;
  }

  // if we do have whitespace, let's add our formatting around our trimmed string
  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const formattedString = start + children + end;

  // and replace the non-whitespace content of the string
  return string.replace(frozenString, formattedString);
}

const reverseStr = (string: string) => string.split('').reverse().join('');
