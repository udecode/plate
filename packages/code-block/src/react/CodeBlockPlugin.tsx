import { useEffect } from 'react';

import { NodeApi } from '@udecode/plate';
import { Key, toPlatePlugin } from '@udecode/plate/react';

import { type TCodeBlockElement, createShikiService } from '../lib';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '../lib/BaseCodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

interface TimeoutState {
  nextAllowedTime: number;
  timeoutId?: NodeJS.Timeout;
}

const shikiService = createShikiService();

// Throttle state per block
const timeoutControls = new Map<string, TimeoutState>();

const throttleHighlighting = (
  blockKey: string,
  performHighlight: () => Promise<void>,
  throttleMs: number
) => {
  const now = Date.now();
  const control = timeoutControls.get(blockKey) || {
    nextAllowedTime: 0,
    timeoutId: undefined,
  };

  clearTimeout(control.timeoutId);

  const delay = Math.max(0, control.nextAllowedTime - now);
  control.timeoutId = setTimeout(() => {
    performHighlight().catch(console.error);
    control.nextAllowedTime = now + throttleMs;
  }, delay);

  timeoutControls.set(blockKey, control);
};

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
  useHooks: ({ editor, getOptions, setOption, type }) => {
    useEffect(() => {
      const updateTokens = async (
        node: TCodeBlockElement & { id: string },
        path: number[]
      ) => {
        const options = getOptions();
        const langName = (node.lang as string) ?? 'plaintext';
        const code = node.children
          .map((child) => NodeApi.string(child))
          .join('\n');

        const performHighlight = async () => {
          try {
            const tokens = await shikiService.tokenizeCode(
              code,
              langName,
              options.theme!
            );

            console.log(tokens, code, langName, options.theme);

            // Update tokens in plugin options
            setOption('annotations', {
              ...getOptions().annotations,
              [node.id]: tokens,
            });

            // Trigger redecorate
            editor.api.redecorate();
          } catch (error) {
            console.error('Shiki highlighting error:', error);
          }
        };

        throttleHighlighting(node.id, performHighlight, 150);
      };

      // Process all code blocks
      const nodes = editor.api.nodes({
        at: [],
        match: { type },
      });

      for (const [node, path] of nodes) {
        void updateTokens(node as any, path);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  },
}).extend(({ editor, plugin }) => ({
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
