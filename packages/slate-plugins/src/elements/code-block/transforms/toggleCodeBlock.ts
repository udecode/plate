import { Editor, Transforms } from 'slate';
import { getNodes } from '../../../common/queries';
import { someNode } from '../../../common/queries/someNode';
import { wrapNodes } from '../../../common/transforms/wrapNodes';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import {
  CodeBlockContainerOptions,
  CodeBlockOptions,
  CodeLineOptions,
} from '../types';
import { unwrapCodeBlock } from './unwrapCodeBlock';

export const toggleCodeBlock = (
  editor: Editor,
  options: CodeBlockOptions & CodeBlockContainerOptions & CodeLineOptions
) => {
  if (!editor.selection) return;

  const { code_block, code_block_container, code_line } = setDefaults(
    options,
    DEFAULTS_CODE_BLOCK
  );

  const isActive = someNode(editor, { match: { type: code_block.type } });

  unwrapCodeBlock(editor, options);

  Transforms.setNodes(editor, {
    type: code_line.type,
  });

  if (!isActive) {
    const codeBlockContainer = {
      type: code_block_container.type,
      children: [],
    };
    wrapNodes(editor, codeBlockContainer);

    // This should probably be a single node

    const codeBlockNodes = [
      ...getNodes(editor, { match: { type: code_block.type } }),
    ];

    const codeBlock = { type: code_block.type, children: [] };

    // This loop should probably just be a single call

    for (const [, path] of codeBlockNodes) {
      // Transforms.wrapNodes(editor, codeBlock, {
      Transforms.setNodes(editor, codeBlock, {
        at: path,
      });
    }

    const nodes = [...getNodes(editor, { match: { type: code_line.type } })];

    const codeLine = { type: code_line.type, children: [] };

    for (const [, path] of nodes) {
      // Transforms.wrapNodes(editor, codeLine, {
      Transforms.setNodes(editor, codeLine, {
        at: path,
      });
    }
  }
};
