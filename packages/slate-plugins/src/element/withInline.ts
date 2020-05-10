import { Editor } from 'slate';

// Set a list of element types to inline
export const withInline = (types: string[]) => <T extends Editor>(
  editor: T
) => {
  const { isInline } = editor;

  editor.isInline = (element) =>
    types.includes(element.type as string) ? true : isInline(element);

  return editor;
};
