import { Ancestor, Editor, NodeEntry } from 'slate';
import { CodeBlockOptions } from '../types';

export interface OutdentCodeBlockLineOptions {
  codeBlock: NodeEntry<Ancestor>;
  codeBlockLine: NodeEntry<Ancestor>;
}

export const outdentCodeBlockLine = (
  editor: Editor,
  { codeBlock, codeBlockLine }: OutdentCodeBlockLineOptions,
  options?: CodeBlockOptions
) => {
  const [codeBlockNode] = codeBlock;
  const [, codeBlockLinePath] = codeBlockLine;

  // do some magic to outdent
};
