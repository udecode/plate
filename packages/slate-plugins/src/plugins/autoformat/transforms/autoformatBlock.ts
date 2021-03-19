import { Editor, Location, Transforms } from 'slate';

export const autoformatBlock = (
  editor: Editor,
  type: string,
  at: Location,
  {
    preFormat,
    format,
  }: {
    preFormat?: (editor: Editor) => void;
    format?: (editor: Editor) => void;
  }
) => {
  Transforms.delete(editor, { at });

  preFormat?.(editor);

  if (!format) {
    Transforms.setNodes(
      editor,
      { type },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  } else {
    format(editor);
  }
};
