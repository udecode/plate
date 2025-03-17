import {
  type DecoratedRange,
  type NodeEntry,
  type SlateEditor,
  type TElement,
  NodeApi,
} from '@udecode/plate';

import type { TCodeBlockElement } from './types';

import {
  BaseCodeBlockPlugin,
  BaseCodeSyntaxPlugin,
} from './BaseCodeBlockPlugin';

// Cache for storing decorations per code line element
export const CODE_LINE_TO_DECORATIONS = new WeakMap<
  TElement,
  DecoratedRange[]
>();

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
export function codeBlockToDecorations(
  editor: SlateEditor,
  [block, blockPath]: NodeEntry<TCodeBlockElement>
) {
  const { defaultLanguage, ...options } =
    editor.getOptions(BaseCodeBlockPlugin);
  const lowlight = options.lowlight!;

  // Get all code lines and combine their text
  const text = block.children.map((line) => NodeApi.string(line)).join('\n');
  const language = block.lang;
  const effectiveLanguage = language || defaultLanguage;

  let highlighted;
  try {
    // Skip highlighting for plaintext or when no language is specified
    if (!effectiveLanguage || effectiveLanguage === 'plaintext') {
      highlighted = { value: [] }; // Empty result for plaintext
    } else if (effectiveLanguage === 'auto') {
      highlighted = lowlight.highlightAuto(text);
    } else {
      highlighted = lowlight.highlight(effectiveLanguage, text);
    }
  } catch (error) {
    // Verify if language is registered, fallback to plaintext if not
    const availableLanguages = lowlight.listLanguages();
    const isLanguageRegistered =
      effectiveLanguage && availableLanguages.includes(effectiveLanguage);
    if (isLanguageRegistered) {
      editor.api.debug.error(error, 'CODE_HIGHLIGHT');
      highlighted = { value: [] }; // Empty result on error
    } else {
      editor.api.debug.warn(
        `Language "${effectiveLanguage}" is not registered. Falling back to plaintext`
      );
      highlighted = { value: [] };
    }
  }

  // Parse and normalize tokens
  const tokens = parseNodes(getHighlightNodes(highlighted));
  const normalizedTokens = normalizeTokens(tokens);
  const blockChildren = block.children as TElement[];

  // Create decorations map
  const nodeToDecorations = new Map<TElement, DecoratedRange[]>();

  // Safety check: don't process more lines than we have children
  const numLines = Math.min(normalizedTokens.length, blockChildren.length);

  // Process each line's tokens
  for (let index = 0; index < numLines; index++) {
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

export function setCodeBlockToDecorations(
  editor: SlateEditor,
  [block, blockPath]: NodeEntry<TCodeBlockElement>
) {
  const decorations = codeBlockToDecorations(editor, [block, blockPath]);

  // Update the global cache with the new decorations
  for (const [node, decs] of decorations.entries()) {
    CODE_LINE_TO_DECORATIONS.set(node, decs);
  }
}

export function resetCodeBlockDecorations(codeBlock: TCodeBlockElement) {
  codeBlock.children.forEach((line) => {
    CODE_LINE_TO_DECORATIONS.delete(line as TElement);
  });
}
