import { unwrapNodes } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

export const unwrapCodeBlock = (
  editor: Editor,
  options: SlatePluginsOptions
) => {
  const { code_block, code_line } = options;

  unwrapNodes(editor, { match: { type: code_line.type } });
  unwrapNodes(editor, { match: { type: code_block.type }, split: true });
};
