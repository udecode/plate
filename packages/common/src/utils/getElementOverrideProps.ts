import {
  SPEditor,
  SPRenderLeafProps,
  SPRenderNodeProps,
} from '@udecode/plate-core';
import { GetElementOverridePropsParams } from '../types';
import { getOverrideProps } from './getOverrideProps';

export const getElementOverrideProps = (
  editor: SPEditor,
  {
    type,
    types,
    options,
    defaultOption,
    classNames,
  }: GetElementOverridePropsParams
) => {
  return ({
    element,
    style,
    className,
  }: SPRenderLeafProps | SPRenderNodeProps) => {
    if (!element) return {};

    const value = element[type];

    // check if the element type matches the allowed types
    if (types.includes(element.type)) {
      return getOverrideProps(editor, {
        className,
        classNames,
        defaultOption,
        options,
        style,
        type,
        value,
      });
    }

    return {};
  };
};
