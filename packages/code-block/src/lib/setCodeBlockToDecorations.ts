import {
  type DecoratedRange,
  type NodeEntry,
  type BasePlateEditor,
  type TCodeBlockElement,
  KEYS,
  NodeApi,
} from 'platejs';
import type { Element } from '@platejs/plite';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import { ensureStablePythonGrammar } from './ensureStablePythonGrammar';

// Cache for storing decorations per code line element
export const CODE_LINE_TO_DECORATIONS: WeakMap<Element, DecoratedRange[]> =
  new WeakMap();
export const CODE_BLOCK_TO_DECORATION_LANGUAGE: WeakMap<
  TCodeBlockElement,
  string | undefined
> = new WeakMap();

type HighlightNode = Record<string, unknown>;

const EMPTY_HIGHLIGHT = { value: [] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getClassNames = (properties: unknown) => {
  if (!isRecord(properties)) return [];

  const rawClassName = properties.className;

  if (Array.isArray(rawClassName)) {
    return rawClassName.filter(
      (item): item is string => typeof item === 'string'
    );
  }

  if (typeof rawClassName === 'string') {
    return [rawClassName];
  }

  return [];
};

const toHighlightNodes = (value: unknown): HighlightNode[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord);
};

// Helper function to get highlight nodes from Lowlight result
function getHighlightNodes(result: unknown): HighlightNode[] {
  if (!isRecord(result)) return [];

  const value = toHighlightNodes(result.value);

  return value.length > 0 ? value : toHighlightNodes(result.children);
}

// Helper function to parse nodes from Lowlight's hast tree
function parseNodes(
  nodes: HighlightNode[],
  className: string[] = []
): { classes: string[]; text: string }[] {
  return nodes.flatMap((node) => {
    const classes = [...className, ...getClassNames(node.properties)];
    const children = toHighlightNodes(node.children);

    if (children.length > 0) {
      return parseNodes(children, classes);
    }

    if (typeof node.value !== 'string') {
      return [];
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
        currentLine = [];
        lines.push(currentLine);
      }
    }
  }

  return lines;
}

// Helper function to compute decorations for a code block
export function codeBlockToDecorations(
  editor: BasePlateEditor,
  [block, blockPath]: NodeEntry<TCodeBlockElement>
): Map<Element, DecoratedRange[]> {
  const { defaultLanguage, ...options } =
    editor.getOptions(BaseCodeBlockPlugin);
  const lowlight = options.lowlight!;

  // Get all code lines and combine their text
  const text = block.children.map((line) => NodeApi.string(line)).join('\n');
  const language = block.lang;
  const effectiveLanguage = language || defaultLanguage;

  ensureStablePythonGrammar(lowlight, effectiveLanguage);

  let highlighted: unknown;
  try {
    // Skip highlighting for plaintext or when no language is specified
    if (!effectiveLanguage || effectiveLanguage === 'plaintext') {
      highlighted = EMPTY_HIGHLIGHT;
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
      editor.api.debug.warn(
        `Could not highlight with Highlight.js for language "${effectiveLanguage}". Falling back to plaintext`,
        'CODE_HIGHLIGHT',
        error
      );
      highlighted = EMPTY_HIGHLIGHT;
    } else {
      editor.api.debug.warn(
        `Language "${effectiveLanguage}" is not registered. Falling back to plaintext`
      );
      highlighted = EMPTY_HIGHLIGHT;
    }
  }

  // Parse and normalize tokens
  const tokens = parseNodes(getHighlightNodes(highlighted));
  const normalizedTokens = normalizeTokens(tokens);
  const blockChildren = block.children as Element[];

  // Create decorations map
  const nodeToDecorations = new Map<Element, DecoratedRange[]>();

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

      const decoration: DecoratedRange & Record<string, unknown> = {
        anchor: {
          offset: start,
          path: [...blockPath, index, 0],
        },
        className: token.classes.join(' '),
        focus: {
          offset: end,
          path: [...blockPath, index, 0],
        },
        [KEYS.codeSyntax]: true,
      };

      nodeToDecorations.get(element)!.push(decoration);
      start = end;
    }
  }

  return nodeToDecorations;
}

export function setCodeBlockToDecorations(
  editor: BasePlateEditor,
  [block, blockPath]: NodeEntry<TCodeBlockElement>
) {
  const { defaultLanguage } = editor.getOptions(BaseCodeBlockPlugin);
  const decorations = codeBlockToDecorations(editor, [block, blockPath]);

  CODE_BLOCK_TO_DECORATION_LANGUAGE.set(
    block,
    block.lang || defaultLanguage || undefined
  );

  // Update the global cache with the new decorations
  for (const [node, decs] of decorations.entries()) {
    CODE_LINE_TO_DECORATIONS.set(node, decs);
  }
}

export function resetCodeBlockDecorations(codeBlock: TCodeBlockElement) {
  CODE_BLOCK_TO_DECORATION_LANGUAGE.delete(codeBlock);

  codeBlock.children.forEach((line) => {
    CODE_LINE_TO_DECORATIONS.delete(line as Element);
  });
}
