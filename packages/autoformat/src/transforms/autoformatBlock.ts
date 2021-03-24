import { SPEditor } from '@udecode/slate-plugins-core';
import { Editor, Location, Transforms } from 'slate';
import { AutoformatRule } from '../types';

export const autoformatBlock = (
  editor: SPEditor,
  type: string,
  at: Location,
  { preFormat, format }: Pick<AutoformatRule, 'preFormat' | 'format'>
) => {
  Transforms.delete(editor, { at });

  preFormat?.(editor);

  if (!format) {
    Transforms.setNodes(editor, { type } as any, {
      match: (n) => Editor.isBlock(editor, n),
    });
  } else {
    format(editor);
  }
};
