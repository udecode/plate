import { castArray } from 'lodash';
import { Editor } from 'slate';
import { SlatePlugin } from '../common';

export interface WithInlineVoidOptions {
  plugins?: SlatePlugin[];
  inlineTypes?: string[];
  voidTypes?: string[];
}

// Set a list of element types to inline/void
export const withInlineVoid = ({
  plugins = [],
  inlineTypes = [],
  voidTypes = [],
}: WithInlineVoidOptions) => <T extends Editor>(editor: T) => {
  const { isInline } = editor;
  const { isVoid } = editor;

  let allInlineTypes = [...inlineTypes];
  let allVoidTypes = [...voidTypes];

  plugins.forEach((plugin) => {
    if (plugin.inlineTypes) {
      allInlineTypes = allInlineTypes.concat(castArray(plugin.inlineTypes));
    }
    if (plugin.voidTypes) {
      allVoidTypes = allVoidTypes.concat(castArray(plugin.voidTypes));
    }
  });

  editor.isInline = (element) => {
    return allInlineTypes.includes(element.type as string)
      ? true
      : isInline(element);
  };

  editor.isVoid = (element) =>
    allVoidTypes.includes(element.type as string) ? true : isVoid(element);

  return editor;
};
