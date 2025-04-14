/** @jsx jsxt */
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
} from '@udecode/plate-basic-marks/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';
import { ParagraphPlugin } from '@udecode/plate/react';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
jsxt;

import { markdownPlugin } from '../../../../../../apps/www/src/registry/default/components/editor/plugins/markdown-plugin';
import { createSlateEditor, SlateEditor } from '@udecode/plate';
// Helper function to create input and editor with common configuration
export const defaultPlugins = [
  ParagraphPlugin,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  IndentPlugin,
  IndentListPlugin,
  markdownPlugin,
  EquationPlugin,
  InlineEquationPlugin,
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
