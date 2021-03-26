import { Editor, Location, Transforms } from 'slate';
import { AutoformatRule } from '../types';

export const autoformatBlock = (
  editor: Editor,
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
