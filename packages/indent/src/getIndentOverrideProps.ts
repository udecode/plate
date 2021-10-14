import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import {
  AnyObject,
  getPlatePluginType,
  OverrideProps,
} from '@udecode/plate-core';
import clsx from 'clsx';
import { Editor } from 'slate';
import { IndentOverridePropsOptions } from './types';

export const getIndentOverrideProps = ({
  classNames,
  offset = 24,
  unit = 'px',
  types: _types,
}: IndentOverridePropsOptions = {}): OverrideProps => (editor) => ({
  element,
  style,
  className,
}) => {
  if (!element) return;

  const { indent } = element;
  if (!indent) return;

  const isBlock = Editor.isBlock(editor, element);
  if (!isBlock) return;

  const types = _types ?? getPlatePluginType(editor, ELEMENT_DEFAULT);

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
