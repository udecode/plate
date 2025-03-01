import type { createLowlight } from 'lowlight';

import {
  type DecoratedRange,
  type NodeEntry,
  type PluginConfig,
  type SlateEditor,
  type TElement,
  createSlatePlugin,
  createTSlatePlugin,
  HtmlPlugin,
  NodeApi,
} from '@udecode/plate';

import type { TCodeBlockElement } from './types';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { withCodeBlock } from './withCodeBlock';

// Cache for storing decorations per code line element
const nodeToDecorations = new WeakMap<TElement, DecoratedRange[]>();

// Helper function to get highlight nodes from Lowlight result
function getHighlightNodes(result: any) {
  return result.value || result.children || [];
}

// Helper function to parse nodes from Lowlight's hast tree
function parseNodes(
  nodes: any[],
  className: string[] = []
): { classes: string[]; text: string }[] {
  return nodes.flatMap((node) => {
    const classes = [
      ...className,
      ...(node.properties ? node.properties.className : []),
    ];
    if (node.children) {
      return parseNodes(node.children, classes);
    }
    return { classes, text: node.value };
  });
}

// Helper function to normalize tokens by line
function normalizeTokens(tokens: { classes: string[]; text: string }[]) {
  const lines: { classes: string[]; content: string }[][] = [[]];
  let currentLine = lines[0];

  for (const token of tokens) {
    const tokenLines = token.text.split('\n');

    for (let i = 0; i < tokenLines.length; i++) {
      const content = tokenLines[i];

      if (content) {
        currentLine.push({ classes: token.classes, content });
      }

      // Create a new line unless we're on the last line
      if (i < tokenLines.length - 1) {
        lines.push([]);
        currentLine = lines.at(-1) as any;
      }
    }
  }

  return lines;
}

// Helper function to compute decorations for a code block
function getChildNodeToDecorations(
  editor: SlateEditor,
  [block, blockPath]: NodeEntry<TCodeBlockElement>
) {
  const { defaultLanguage, lowlight } = editor.getOptions(BaseCodeBlockPlugin);

  // Get all code lines and combine their text
  const text = block.children.map((line) => NodeApi.string(line)).join('\n');
  const language = block.lang;

  // Highlight the code
  let highlighted;
  try {
    const effectiveLanguage = language || defaultLanguage;

    // Skip highlighting for plaintext or when no language is specified
    if (!effectiveLanguage || effectiveLanguage === 'plaintext') {
      highlighted = { value: [] }; // Empty result for plaintext
    } else if (effectiveLanguage === 'auto') {
      highlighted = lowlight!.highlightAuto(text);
    } else {
      highlighted = lowlight!.highlight(effectiveLanguage, text);
    }
  } catch (error) {
    editor.api.debug.error('Highlighting error:', 'CODE_HIGHLIGHT', error);
    highlighted = { value: [] }; // Empty result on error
  }

  // Parse and normalize tokens
  const tokens = parseNodes(getHighlightNodes(highlighted));
  const normalizedTokens = normalizeTokens(tokens);
  const blockChildren = block.children as TElement[];

  // Create decorations map
  const nodeToDecorations = new Map<TElement, DecoratedRange[]>();

  // Process each line's tokens
  for (let index = 0; index < normalizedTokens.length; index++) {
    const lineTokens = normalizedTokens[index];
    const element = blockChildren[index];

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, []);
    }

    let start = 0;
    for (const token of lineTokens) {
      const length = token.content.length;
      if (!length) continue;

      const end = start + length;

      const decoration: DecoratedRange = {
        anchor: {
          offset: start,
          path: [...blockPath, index, 0],
        },
        [BaseCodeSyntaxPlugin.key]: true,
        className: token.classes.join(' '),
        focus: {
          offset: end,
          path: [...blockPath, index, 0],
        },
      } as any;

      nodeToDecorations.get(element)!.push(decoration);
      start = end;
    }
  }

  return nodeToDecorations;
}

export type CodeBlockConfig = PluginConfig<
  'code_block',
  {
    /**
     * Default language to use when no language is specified. Set to null to
     * disable syntax highlighting by default.
     */
    defaultLanguage?: string | null;
    /**
     * Lowlight instance to use for highlighting. If not provided, syntax
     * highlighting will be disabled.
     */
    lowlight?: ReturnType<typeof createLowlight> | null;
  }
>;

export const BaseCodeLinePlugin = createTSlatePlugin({
  key: 'code_line',
  node: { isElement: true },
});

export const BaseCodeSyntaxPlugin = createSlatePlugin({
  key: 'code_syntax',
  node: { isLeaf: true },
});

export const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
  key: 'code_block',
  inject: {
    plugins: {
      [HtmlPlugin.key]: {
        parser: {
          query: ({ editor }) =>
            !editor.api.some({
              match: { type: editor.getType(BaseCodeLinePlugin) },
            }),
        },
      },
    },
  },
  node: { isElement: true },
  options: {
    defaultLanguage: null,
    lowlight: null,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [BaseCodeLinePlugin, BaseCodeSyntaxPlugin],
  decorate: ({ editor, entry: [node, path], type }) => {
    const codeLineType = editor.getType(BaseCodeLinePlugin);

    // Initialize decorations for the code block, we assume code line decorate will be called next.
    if (
      node.type === type &&
      !nodeToDecorations.get((node.children as TElement[])[0])
    ) {
      const decorations = getChildNodeToDecorations(editor, [
        node,
        path,
      ] as NodeEntry<TCodeBlockElement>);

      // Update the global cache with the new decorations
      for (const [node, decs] of decorations.entries()) {
        nodeToDecorations.set(node, decs);
      }
    }

    // Only return cached decorations for code lines
    if (node.type === codeLineType) {
      return nodeToDecorations.get(node as TElement) || [];
    }

    return [];
  },
})
  .overrideEditor(
    ({ editor, getOptions, tf: { apply, normalizeNode }, type }) => ({
      transforms: {
        apply(operation) {
          if (operation.type === 'set_node') {
            const entry = editor.api.node(operation.path);

            if (entry?.[0].type === type && operation.newProperties?.lang) {
              const codeBlock = entry[0] as TCodeBlockElement;
              // Clear decorations for all code lines in this block
              codeBlock.children.forEach((line) => {
                nodeToDecorations.delete(line as TElement);
              });
            }
          }

          apply(operation);
        },
        normalizeNode(entry, options) {
          const [node] = entry;

          // Decorate is called on selection change as well, so we prefer to only run this on code block changes.
          if (node.type === type && getOptions().lowlight) {
            const decorations = getChildNodeToDecorations(
              editor,
              entry as NodeEntry<TCodeBlockElement>
            );

            // Update the global cache with the new decorations
            for (const [node, decs] of decorations.entries()) {
              nodeToDecorations.set(node, decs);
            }
          }

          normalizeNode(entry, options);
        },
      },
    })
  )
  .overrideEditor(withCodeBlock);
