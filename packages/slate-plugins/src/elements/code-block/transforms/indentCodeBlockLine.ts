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

  // do some magic to indent
};
