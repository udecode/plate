/** @jsx jsxt */
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  BasicMarksPlugin,
} from '@platejs/basic-nodes/react';
import { ListPlugin } from '@platejs/list/react';
import { IndentPlugin } from '@platejs/indent/react';
import { jsxt } from '@platejs/test-utils';
import { ParagraphPlugin } from 'platejs/react';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';
jsxt;

import { MarkdownKit } from '../../../../../../../apps/www/src/registry/components/editor/plugins/markdown-kit';
import { createSlateEditor, SlateEditor } from 'platejs';
import { AIPlugin } from '../../../ai/AIPlugin';
import { AIChatPlugin } from '../../AIChatPlugin';
// Helper function to create input and editor with common configuration
export const defaultPlugins = [
  ParagraphPlugin,
  BasicMarksPlugin,
  IndentPlugin,
  ListPlugin,
  ...MarkdownKit,
  EquationPlugin,
  InlineEquationPlugin,
  AIPlugin,
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
