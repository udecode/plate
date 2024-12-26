import { type SlateEditor, setMarks } from '@udecode/plate-common';

import { BaseFontSizePlugin } from '../BaseFontSizePlugin';

export const setChangedFontSize = (
  editor: SlateEditor,
  options: getChangedFontSizeOptions
): void => {
  const { fontSize, increase, unitConfig } = options;

  setMarks(editor, {
    [BaseFontSizePlugin.key]: getChangedFontSize({
      fontSize,
      increase,
      unitConfig,
    }),
  });
};

export type getChangedFontSizeOptions = {
  unitConfig: {
    increment: number;
    unitRegex: RegExp;
  }[];
  fontSize: string;
  increase: boolean;
};

const getChangedFontSize = (options: getChangedFontSizeOptions): string => {
  const { fontSize, increase, unitConfig } = options;

  if (!fontSize) return '16px';

  for (const config of unitConfig) {
    const match = config.unitRegex.exec(fontSize);

    if (match) {
      const [, value] = match;
      const numericValue = Number.parseFloat(value);
      const newValue = increase
        ? numericValue + config.increment
        : numericValue - config.increment;

      const unit = match[0].replace(value, '');

      return `${Number(newValue.toFixed(3))}${unit}`;
    }
  }

  return fontSize;
};
