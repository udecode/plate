import {
  SPEditor,
  SPRenderLeafProps,
  SPRenderNodeProps,
} from '@udecode/plate-core';
import { GetLeafOverrideProps } from '../types';
import { getOverrideProps } from './getOverrideProps';

export const getLeafOverrideProps = (
  editor: SPEditor,
  { type, options, defaultOption, classNames }: GetLeafOverrideProps
) => {
  return ({
    text,
    style,
    className,
  }: SPRenderLeafProps | SPRenderNodeProps) => {
    if (!text) return {};

    const value = text[type];

    return getOverrideProps(editor, {
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
