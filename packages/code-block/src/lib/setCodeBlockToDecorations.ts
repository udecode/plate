import type { createLowlight } from 'lowlight';

import { type BaseEditor, getEditorPlugin } from '@platejs/core';
import {
  type DecoratedRange,
  type Element,
  ElementApi,
  type NodeEntry,
  NodeApi,
} from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import type { CodeHighlightConfig } from './BaseCodeBlockPlugin';
import { ensureStablePythonGrammar } from './ensureStablePythonGrammar';

type CodeBlockDecoration = DecoratedRange & {
  className: string;
  [NODES.codeSyntax]: true;
};

type HighlightResult = ReturnType<
  ReturnType<typeof createLowlight>['highlight']
>;

type HighlightNode = HighlightResult['children'][number];

// Cache for storing decorations per code line element
export const CODE_LINE_TO_DECORATIONS: WeakMap<Element, DecoratedRange[]> =
  new WeakMap();

// Helper function to parse nodes from Lowlight's hast tree
function parseNodes(
  nodes: HighlightNode[],
  className: string[] = []
): { classes: string[]; text: string }[] {
  return nodes.flatMap((node) => {
    if (node.type === 'element') {
      const nodeClassName = node.properties.className;
      const classes = [
        ...className,
        ...(Array.isArray(nodeClassName)
          ? nodeClassName.map(String)
          : typeof nodeClassName === 'string'
            ? [nodeClassName]
            : []),
      ];

      return parseNodes(node.children, classes);
    }

    if (node.type === 'text') {
      return [{ classes: className, text: node.value }];
    }

    return [];
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
        currentLine = lines.at(-1)!;
      }
    }
  }

  return lines;
}

// Helper function to compute decorations for a code block
export function codeBlockToDecorations(
  editor: BaseEditor,
  [block, blockPath]: NodeEntry<Element>
): Map<Element, DecoratedRange[]> {
  const { defaultLanguage, ...options } = getEditorPlugin<CodeHighlightConfig>(
    editor,
    {
      key: KEYS.codeSyntax,
    }
  ).getOptions();
  const lowlight = options.lowlight!;

  // Get all code lines and combine their text
  const text = block.children.map((line) => NodeApi.string(line)).join('\n');
  const language = typeof block.lang === 'string' ? block.lang : undefined;
  const effectiveLanguage = language || defaultLanguage;

  ensureStablePythonGrammar(lowlight, effectiveLanguage);

  let highlighted: HighlightResult;
  try {
    // Skip highlighting for plaintext or when no language is specified
    if (!effectiveLanguage || effectiveLanguage === 'plaintext') {
      highlighted = { children: [], type: 'root' };
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
      highlighted = { children: [], type: 'root' };
    } else {
      editor.api.debug.warn(
        `Language "${effectiveLanguage}" is not registered. Falling back to plaintext`
      );
      highlighted = { children: [], type: 'root' };
    }
  }

  // Parse and normalize tokens
  const tokens = parseNodes(highlighted.children);
  const normalizedTokens = normalizeTokens(tokens);
  // Create decorations map
  const nodeToDecorations = new Map<Element, DecoratedRange[]>();

  // Safety check: don't process more lines than we have children
  const numLines = Math.min(normalizedTokens.length, block.children.length);

  // Process each line's tokens
  for (let index = 0; index < numLines; index++) {
    const lineTokens = normalizedTokens[index];
    const element = block.children[index];

    if (!ElementApi.isElement(element)) continue;

    const lineDecorations = nodeToDecorations.get(element) ?? [];

    nodeToDecorations.set(element, lineDecorations);

    let start = 0;
    for (const token of lineTokens) {
      const length = token.content.length;
      if (!length) continue;

      const end = start + length;

      const decoration: CodeBlockDecoration = {
        anchor: {
          offset: start,
          path: [...blockPath, index, 0],
        },
        className: token.classes.join(' '),
        focus: {
          offset: end,
          path: [...blockPath, index, 0],
        },
        [NODES.codeSyntax]: true,
      };

      lineDecorations.push(decoration);
      start = end;
    }
  }

  return nodeToDecorations;
}

export function setCodeBlockToDecorations(
  editor: BaseEditor,
  [block, blockPath]: NodeEntry<Element>
) {
  const decorations = codeBlockToDecorations(editor, [block, blockPath]);

  // Update the global cache with the new decorations
  for (const [node, decs] of decorations.entries()) {
    CODE_LINE_TO_DECORATIONS.set(node, decs);
  }
}

export function resetCodeBlockDecorations(codeBlock: Element) {
  codeBlock.children.forEach((line) => {
    if (ElementApi.isElement(line)) {
      CODE_LINE_TO_DECORATIONS.delete(line);
    }
  });
}
