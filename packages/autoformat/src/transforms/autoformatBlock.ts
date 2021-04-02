import { setNodes } from '@udecode/slate-plugins-common';
import { TEditor, TElement } from '@udecode/slate-plugins-core';
import { Editor, Location, Transforms } from 'slate';
import { AutoformatRule } from '../types';

export const autoformatBlock = (
  editor: TEditor,
  type: string,
  at: Location,
  { preFormat, format }: Pick<AutoformatRule, 'preFormat' | 'format'>
) => {
  Transforms.delete(editor, { at });

  preFormat?.(editor);

  if (!format) {
    setNodes<TElement>(
      editor,
      { type },
      {
        match: (n) => Editor.isBlock(editor, n),
      }
    );
  } else {
    format(editor);
  }
};
