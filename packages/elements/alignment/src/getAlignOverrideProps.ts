import {
  AnyObject,
  getPlatePluginOptions,
  OverrideProps,
} from '@udecode/plate-core';
import clsx from 'clsx';
import { Editor } from 'slate';
import { KEY_ALIGN } from './defaults';
import { AlignPluginOptions } from './types';

export const getAlignOverrideProps = (): OverrideProps => (editor) => {
  const {
    alignments,
    classNames,
    defaultAlignment,
    types,
  } = getPlatePluginOptions<Required<AlignPluginOptions>>(editor, KEY_ALIGN);

  return ({ element, style, className }) => {
    if (!element) return;

    const { align } = element;

    if (!align || align === defaultAlignment || !alignments.includes(align))
      return;

    const isBlock = Editor.isBlock(editor, element);
    if (!isBlock) return;

    if (types.includes(element.type)) {
      const res: AnyObject = {};

      if (classNames?.[align]) {
        res.className = clsx(className, classNames[align]);
      } else {
        res.style = { ...style, textAlign: align };
      }

      return res;
    }
  };
};
