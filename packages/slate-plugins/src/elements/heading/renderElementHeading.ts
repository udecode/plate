import { RenderElementProps } from 'slate-react';
import { RenderNodeOptions } from '../../common/types/PluginOptions.types';
import { getRenderElements } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_HEADING } from './defaults';
import { HeadingRenderElementOptions } from './types';

/**
 * Font sizes are relative to the base font size
 * H1 - fs * 20/11
 * H2 - fs * 16/11
 * H3 - fs * 14/11
 * H4 - fs * 12/11
 * H5 - fs * 1
 * H6 - fs * 1
 */
export const renderElementHeading = (options?: HeadingRenderElementOptions) => (
  props: RenderElementProps
) => {
  const { h1, h2, h3, h4, h5, h6, levels } = setDefaults(
    options,
    DEFAULTS_HEADING
  );

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
