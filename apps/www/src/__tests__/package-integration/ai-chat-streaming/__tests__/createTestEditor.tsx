/** @jsx jsxt */
import { jsxt } from '@platejs/test-utils';
import { KEYS, createSlateEditor, type SlateEditor } from 'platejs';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// biome-ignore lint/nursery/noUnusedExpressions: required to prevent removal by compiler
jsxt;

import { AIChatPlugin } from '../../../../../../../packages/ai/src/react/ai-chat/AIChatPlugin';
import { BaseAIPlugin } from '../../../../../../../packages/ai/src/lib/BaseAIPlugin';
import { BaseBasicMarksPlugin } from '../../../../../../../packages/basic-nodes/src/lib/BaseBasicMarksPlugin';
import { BaseIndentPlugin } from '../../../../../../../packages/indent/src/lib/BaseIndentPlugin';
import { BaseListPlugin } from '../../../../../../../packages/list/src/lib/BaseListPlugin';
import { MarkdownPlugin } from '../../../../../../../packages/markdown/src/lib/MarkdownPlugin';
import {
  remarkMdx,
  remarkMention,
} from '../../../../../../../packages/markdown/src/lib/plugins';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from '../../../../../../../packages/math/src/lib';
import { BaseParagraphPlugin } from '../../../../../../../packages/core/src/lib/plugins/paragraph/BaseParagraphPlugin';

const markdownPlugin = MarkdownPlugin.configure({
  options: {
    plainMarks: [KEYS.suggestion, KEYS.comment],
    remarkPlugins: [remarkMath, remarkGfm, remarkMdx, remarkMention],
  },
});
// Helper function to create input and editor with common configuration
export const defaultPlugins = [
  BaseParagraphPlugin,
  BaseBasicMarksPlugin,
  BaseIndentPlugin,
  BaseListPlugin,
  markdownPlugin,
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  BaseAIPlugin,
  AIChatPlugin,
];

export const createTestEditor = () => {
  const input = (
    <editor>
      <hp>
        <cursor />
      </hp>
    </editor>
  ) as any as SlateEditor;

  const editor = createSlateEditor({
    plugins: defaultPlugins,
    selection: input.selection,
    value: input.children,
  }) as any;

  return { editor, input };
};
