import {
  SPEditor,
  SPRenderLeafProps,
  SPRenderNodeProps,
} from '@udecode/plate-core';
import { LeafOverridePropsOptions } from '../types';
import { getNodeOverrideProps } from './getNodeOverrideProps';

export const getLeafOverrideProps = (
  editor: SPEditor,
  { type, options, defaultOption, classNames }: LeafOverridePropsOptions
) => {
  return ({
    text,
    style,
    className,
  }: SPRenderLeafProps | SPRenderNodeProps) => {
    if (!text) return {};

    const value = text[type];

    return getNodeOverrideProps(editor, {
      className,
      classNames,
      defaultOption,
      options,
      style,
      type,
      value,
    });
  };
};
