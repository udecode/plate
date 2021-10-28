import {
  SPEditor,
  SPRenderLeafProps,
  SPRenderNodeProps,
} from '@udecode/plate-core';
import { ElementOverridePropsOptions } from '../types';
import { getNodeOverrideProps } from './getNodeOverrideProps';

export const getElementOverrideProps = (
  editor: SPEditor,
  {
    type,
    types,
    options,
    defaultOption,
    classNames,
  }: ElementOverridePropsOptions
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
      return getNodeOverrideProps(editor, {
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
