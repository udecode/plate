import { useEffect } from 'react';

import type { BundledLanguage, BundledTheme, ThemedToken } from 'shiki';

import { type DecoratedRange, type TElement, NodeApi } from '@udecode/plate';
import { type PlateEditor, Key, toPlatePlugin } from '@udecode/plate/react';

import type { TCodeBlockElement } from '../lib';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '../lib/BaseCodeBlockPlugin';
import { throttleHighlighting, tokenizeCode } from './createShikiService';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);
export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

type CodeDecoration = DecoratedRange & {
  [BaseCodeSyntaxPlugin.key]: true;
  token: Pick<ThemedToken, 'bgColor' | 'color' | 'fontStyle'>;
};

// Throttle state per block
interface ThrottleState {
  nextAllowedTime: number;
  timeoutId?: NodeJS.Timeout;
}
const throttleControls = new Map<string, ThrottleState>();

const updateTokens = async (
  editor: PlateEditor,
  node: TCodeBlockElement & { id: string }
) => {
  const options = editor.getOptions(CodeBlockPlugin);
  const langName = (node.lang as BundledLanguage) ?? 'plaintext';
  const code = node.children.map((child) => NodeApi.string(child)).join('\n');

  // Mark as dirty immediately
  const annotations = options.annotations?.[node.id];
  if (annotations) {
    editor.setOption(CodeBlockPlugin, 'annotations', {
      ...options.annotations,
      [node.id]: {
        ...annotations,
        dirty: true,
      },
    });
  }

  // Perform highlighting
  const performHighlight = async () => {
    try {
      const tokens = await tokenizeCode(
        code,
        langName,
        options.theme as BundledTheme
      );

      // Update tokens in plugin options
      editor.setOption(CodeBlockPlugin, 'annotations', {
        ...editor.getOptions(CodeBlockPlugin).annotations,
        [node.id]: {
          dirty: false,
          tokens,
        },
      });

      // Trigger redecorate
      editor.api.redecorate();
    } catch (error) {
      console.error('Shiki highlighting error:', error);
    }
  };

  // Get or create throttle control for this block
  const control = throttleControls.get(node.id) || {
    nextAllowedTime: 0,
    timeoutId: undefined,
  };
  throttleControls.set(node.id, control);

  // If delay is 0, perform highlighting immediately
  if (options.delay === 0) {
    await performHighlight();
    return;
  }

  // Otherwise, use throttling
  throttleHighlighting(performHighlight, control, options.delay!);
};

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
  decorate: ({ editor, entry: [node, path], getOptions, type }) => {
    const options = getOptions();

    if (!options.syntax || node.type !== type) {
      return [];
    }

    // Get annotations for this block using block id
    const blockAnnotations = options.annotations?.[(node as any).id];
    if (!blockAnnotations?.tokens) {
      return [];
    }

    // Return cached decorations if available and block is not dirty
    if (!blockAnnotations.dirty && blockAnnotations.decorations) {
      return blockAnnotations.decorations;
    }

    // Map annotations to line-specific decorations
    const decorations: CodeDecoration[] = [];

    // Process each line directly from node.children
    (node.children as TElement[]).forEach((line, lineIndex) => {
      const linePath = [...path, lineIndex];
      const lineTokens = blockAnnotations.tokens[lineIndex] ?? [];
      let offset = 0;

      lineTokens.forEach((token) => {
        if (token.content) {
          const range = {
            anchor: {
              offset,
              path: linePath,
            },
            focus: {
              offset: offset + token.content.length,
              path: linePath,
            },
          };

          const decoration: CodeDecoration = {
            ...range,
            [BaseCodeSyntaxPlugin.key]: true,
            token: {
              bgColor: token.bgColor,
              color: token.color,
              fontStyle: token.fontStyle,
            },
          };

          decorations.push(decoration);
          offset += token.content.length;
        }
      });
    });

    // Cache the computed decorations
    editor.setOption(CodeBlockPlugin, 'annotations', {
      ...options.annotations,
      [(node as any).id]: {
        ...blockAnnotations,
        decorations,
      },
    });

    return decorations;
  },
  useHooks: ({ editor, type }) => {
    useEffect(() => {
      // Initialize highlighter with all languages from code blocks
      const nodes = [
        ...editor.api.nodes({
          at: [],
          match: { type },
        }),
      ];

      // Process all code blocks
      for (const [node] of nodes) {
        void updateTokens(editor, node as any);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  },
})
  .overrideEditor(({ editor, tf: { normalizeNode }, type }) => ({
    transforms: {
      normalizeNode(entry, options) {
        const [node] = entry;

        if (node.type === type) {
          console.log('HI??');
          void updateTokens(editor, node as any);
        }

        normalizeNode(entry, options);
      },
    },
  }))
  .extend(({ editor, plugin }) => ({
    shortcuts: {
      toggleCodeBlock: {
        keys: [[Key.Mod, Key.Alt, '8']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggleBlock(editor.getType(plugin));
        },
      },
    },
  }));
