import {
  AnyObject,
  getPlatePluginOptions,
  OverrideProps,
} from '@udecode/plate-core';
import clsx from 'clsx';
import { Editor } from 'slate';
import { KEY_INDENT } from './defaults';
import { IndentPluginOptions } from './types';

export const getIndentOverrideProps = (): OverrideProps => (editor) => {
  const { types, classNames, offset, unit } = getPlatePluginOptions<
    Required<IndentPluginOptions>
  >(editor, KEY_INDENT);

  return ({ element, style, className }) => {
    if (!element) return;

    const { indent } = element;
    if (!indent) return;

    const isBlock = Editor.isBlock(editor, element);
    if (!isBlock) return;

    if (types.includes(element.type)) {
      const res: AnyObject = {};

      if (classNames) {
        res.className = clsx(className, classNames[indent - 1]);
      } else {
        res.style = { ...style, marginLeft: offset * indent + unit };
      }

      return res;
    }
  };
};
