import {
  AnyObject,
  getPlatePluginOptions,
  OverrideProps,
} from '@udecode/plate-core';
import clsx from 'clsx';
import { Editor } from 'slate';
import { KEY_LINE_HEIGHT } from './defaults';
import { LineHeightPluginOptions } from './types';

export const getLineHeightOverrideProps = (): OverrideProps => (editor) => {
  const {
    lineHeights,
    classNames,
    defaultLineHeight,
    types,
  } = getPlatePluginOptions<Required<LineHeightPluginOptions>>(
    editor,
    KEY_LINE_HEIGHT
  );

  return ({ element, style, className }) => {
    if (!element) return;

    const value = element[KEY_LINE_HEIGHT];

    if (!value || value === defaultLineHeight || !lineHeights.includes(value))
      return;

    const isBlock = Editor.isBlock(editor, element);
    if (!isBlock) return;

    if (types.includes(element.type)) {
      const res: AnyObject = {};

      if (classNames?.[value]) {
        res.className = clsx(className, classNames[value]);
      } else {
        res.style = { ...style, [KEY_LINE_HEIGHT]: value };
      }

      return res;
    }
  };
};
