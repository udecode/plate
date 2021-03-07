import {
  getNodes,
  setDefaults,
  someNode,
  wrapNodes,
} from '@udecode/slate-plugins-common';
import { Editor, Transforms } from 'slate';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockOptions, CodeLineOptions } from '../types';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (
  editor: Editor,
  options: CodeBlockOptions & CodeLineOptions
) => {
  if (!editor.selection) return;

  const { code_block, code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  const isActive = someNode(editor, { match: { type: code_block.type } });

  unwrapCodeBlock(editor, options);

  Transforms.setNodes(editor, {
    type: code_line.type,
  });

  if (!isActive) {
    const codeBlock = { type: code_block.type, children: [] };
    wrapNodes(editor, codeBlock);

    const nodes = [...getNodes(editor, { match: { type: code_line.type } })];

    const codeLine = { type: code_block.type, children: [] };

    for (const [, path] of nodes) {
      // Transforms.wrapNodes(editor, codeLine, {
      Transforms.setNodes(editor, codeLine, {
        at: path,
      });
    }
  }
};
