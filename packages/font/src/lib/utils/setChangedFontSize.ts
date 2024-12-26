import { type SlateEditor, setMarks } from '@udecode/plate-common';

import { BaseFontSizePlugin } from '../BaseFontSizePlugin';

export const setChangedFontSize = (
  editor: SlateEditor,
  options: getChangedFontSizeOptions
): void => {
  const { fontSize, increase } = options;

  setMarks(editor, {
    [BaseFontSizePlugin.key]: getChangedFontSize({ fontSize, increase }),
  });
};

export type getChangedFontSizeOptions = {
  fontSize: string;
  increase: boolean;
};

const getChangedFontSize = (options: getChangedFontSizeOptions): string => {
  const { fontSize, increase } = options;

  if (!fontSize) return '16px';

  const pxMatch = /^([\d.]+)px$/i.exec(fontSize);

  if (pxMatch) {
    const [, value] = pxMatch;
    const numericValue = Number.parseFloat(value);
    const newValue = increase ? numericValue + 2 : numericValue - 2;

    return `${Number(newValue.toFixed(3))}px`;
  }

  const remMatch = /^([\d.]+)rem$/i.exec(fontSize);

  if (remMatch) {
    const [, value] = remMatch;
    const numericValue = Number.parseFloat(value);
    const newValue = increase ? numericValue + 0.125 : numericValue - 0.125;

    return `${Number(newValue.toFixed(3))}rem`;
  }

  // TODO: Handle other units
  return fontSize;
};
