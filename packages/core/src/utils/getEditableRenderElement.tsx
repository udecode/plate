import * as React from 'react';
import { castArray } from 'lodash';
import { DefaultElement } from 'slate-react';
import {
  PlatePluginComponent,
  PlatePluginOptions,
} from '../types/PlatePluginOptions/PlateOptions';
import { RenderNodeOptions } from '../types/PlatePluginOptions/RenderNodeOptions';
import { SPRenderElementProps } from '../types/SPRenderElementProps';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderElement` handler for `options.type`.
 * If the type is equals to the slate element type, render `options.component`.
 * Else, return `undefined` so the pipeline can check the next plugin.
 */
export const getEditableRenderElement = (options: PlatePluginOptions[]) => (
  props: SPRenderElementProps
) => {
  const _options = castArray<RenderNodeOptions>(options);

  for (const option of _options) {
    const {
      type,
      component: Element = DefaultElement as PlatePluginComponent,
      getNodeProps,
      overrideProps,
    } = option;

    const { element, children } = props;

    if (element.type === type) {
      const nodeProps = getRenderNodeProps({
        attributes: element.attributes,
        getNodeProps,
        overrideProps,
        props,
        type,
      });

      return (
        <Element {...props} {...nodeProps}>
          {children}
        </Element>
      );
    }
  }
};
