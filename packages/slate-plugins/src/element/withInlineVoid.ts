import { Editor } from 'slate';

export interface WithInlineVoidOptions {
  inlineTypes?: string[];
  voidTypes?: string[];
}

// Set a list of element types to inline/void
export const withInlineVoid = ({
  inlineTypes = [],
  voidTypes = [],
}: WithInlineVoidOptions) => <T extends Editor>(editor: T) => {
  const { isInline } = editor;
  const { isVoid } = editor;

  editor.isInline = (element) =>
    inlineTypes.includes(element.type as string) ? true : isInline(element);

  editor.isVoid = (element) =>
    voidTypes.includes(element.type as string) ? true : isVoid(element);

  return editor;
};
