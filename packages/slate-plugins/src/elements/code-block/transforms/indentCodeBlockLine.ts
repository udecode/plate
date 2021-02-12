import { Ancestor, Editor, NodeEntry } from 'slate';
import { CodeBlockOptions } from '../types';

export interface IndentCodeBlockLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeBlockLine: NodeEntry<Ancestor>;
}

export const indentCodeBlockLine = (
  editor: Editor,
  { codeBlock, codeBlockLine }: IndentCodeBlockLineOptions,
  options?: CodeBlockOptions
) => {
  const [codeBlockNode] = codeBlock;
  const [, codeBlockLinePath] = codeBlockLine;

  // get the selection
  // for each code_block_line in the selection, add two spaces to the start of the line
};
