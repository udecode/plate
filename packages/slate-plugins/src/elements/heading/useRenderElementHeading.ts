import {
  getRenderElements,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';
import { useEditorPluginOptions } from '@udecode/slate-plugins-core';
import { RenderElementProps } from 'slate-react';
import {
  DEFAULT_HEADING_LEVEL,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from './defaults';
import { HeadingPluginOptions } from './types';

/**
 * Font sizes are relative to the base font size
 * H1 - fs * 20/11
 * H2 - fs * 16/11
 * H3 - fs * 14/11
 * H4 - fs * 12/11
 * H5 - fs * 1
 * H6 - fs * 1
 */
export const useRenderElementHeading = ({
  levels = DEFAULT_HEADING_LEVEL,
}: HeadingPluginOptions = {}) => {
  const h1 = useEditorPluginOptions(ELEMENT_H1);
  const h2 = useEditorPluginOptions(ELEMENT_H2);
  const h3 = useEditorPluginOptions(ELEMENT_H3);
  const h4 = useEditorPluginOptions(ELEMENT_H4);
  const h5 = useEditorPluginOptions(ELEMENT_H5);
  const h6 = useEditorPluginOptions(ELEMENT_H6);

  return (props: RenderElementProps) => {
    const renderElementsOptions: Required<RenderNodeOptions>[] = [];

    const checkRenderElement = (level: number, optionsValues: any) => {
      if (levels >= level) renderElementsOptions.push(optionsValues);
    };

    checkRenderElement(1, h1);
    checkRenderElement(2, h2);
    checkRenderElement(3, h3);
    checkRenderElement(4, h4);
    checkRenderElement(5, h5);
    checkRenderElement(6, h6);

    return getRenderElements(renderElementsOptions)(props);
  };
};
