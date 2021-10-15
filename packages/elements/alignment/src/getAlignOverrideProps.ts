import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import {
  AnyObject,
  getPlatePluginType,
  OverrideProps,
} from '@udecode/plate-core';
import clsx from 'clsx';
import { Editor } from 'slate';
import {
  DEFAULT_ALIGNMENT,
  DEFAULT_ALIGNMENTS,
  KEY_ALIGNMENT,
} from './defaults';
import { AlignPluginOptions } from './types';

export const getAlignOverrideProps = ({
  alignments = DEFAULT_ALIGNMENTS,
  classNames,
  defaultAlignment = DEFAULT_ALIGNMENT,
  types: _types,
}: AlignPluginOptions = {}): OverrideProps => (editor) => {
  const types = _types ?? getPlatePluginType(editor, ELEMENT_DEFAULT);

  // TODO: extend plate-core to register options
  editor.options[KEY_ALIGNMENT] = {
    types,
    alignments,
    defaultAlignment,
  };

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
