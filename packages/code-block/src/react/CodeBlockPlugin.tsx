import type { DecoratedRange, PluginConfig, TText } from '@udecode/plate';
import type { createLowlight } from 'lowlight';

import { Key, toPlatePlugin, toTPlatePlugin } from '@udecode/plate/react';

import type { TCodeBlockElement } from '../lib';

import {
  BaseCodeBlockPlugin,
  BaseCodeSyntaxPlugin,
} from '../lib/BaseCodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

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

// Helper function to map position in the overall code string to Slate's {path, offset}
function positionToPoint(
  p: number,
  path: number[],
  text: string
): { offset: number; path: number[] } | null {
  if (p <= text.length) {
    return { offset: p, path };
  }
  return null;
}

export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

export type CodeBlockConfig = PluginConfig<
  'code_block',
  {
    /**
     * Lowlight instance to use for highlighting. If not provided, syntax
     * highlighting will be disabled.
     */
    lowlight: ReturnType<typeof createLowlight> | null;
  }
>;

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toTPlatePlugin<CodeBlockConfig>(
  BaseCodeBlockPlugin,
  {
    handlers: {
      onKeyDown: onKeyDownCodeBlock,
    },
    options: {
      lowlight: null,
    },
    plugins: [CodeSyntaxPlugin],
    decorate: ({ editor, entry: [node, path], getOptions, type }) => {
      const options = getOptions();
      if (!options.lowlight || node.type !== type) return [];

      const lowlight = options.lowlight!;
      if (!lowlight) {
        return [];
      }

      const code = (node.children as TText[])[0].text;
      const language = (node as TCodeBlockElement).lang;

      let highlighted;
      try {
        if (!language || language === 'auto') {
          highlighted = lowlight.highlightAuto(code);
        } else {
          highlighted = lowlight.highlight(language, code);
        }
      } catch (error) {
        editor.api.debug.error(
          'Highlighting error:' + (error as any),
          'CODE_BLOCK_HIGHLIGHT'
        );
        highlighted = lowlight.highlightAuto(code); // Fallback to auto-detection
      }

      const tokens = parseNodes(getHighlightNodes(highlighted));
      const decorations: DecoratedRange[] = [];
      let from = 0;

      for (const token of tokens) {
        const to = from + token.text.length;
        const start = positionToPoint(from, path, code);
        const end = positionToPoint(to, path, code);
        if (start && end) {
          decorations.push({
            anchor: start,
            className: token.classes.join(' '),
            [CodeSyntaxPlugin.key]: true,
            focus: end,
          } as any);
        }
        from = to;
      }

      return decorations;
    },
  }
).extend(({ editor, plugin }) => ({
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
