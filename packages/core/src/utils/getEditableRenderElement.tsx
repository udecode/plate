import * as React from 'react';
import { castArray } from 'lodash';
import { DefaultElement } from 'slate-react';
import { RenderNodeOptions } from '../types/SlatePluginOptions/RenderNodeOptions';
import { SlatePluginComponent } from '../types/SlatePluginOptions/SlatePluginsOptions';
import { TRenderElementProps } from '../types/TRenderElementProps';
import { getSlateClass } from './getSlateClass';

/**
 * Get a `Editable.renderElement` handler for `options.type`.
 * If the type is equals to the slate element type, render `options.component`.
 * Else, return `undefined` so the pipeline can check the next plugin.
 */
export const getEditableRenderElement = (
  options: RenderNodeOptions | RenderNodeOptions[]
) => ({ attributes, element, children }: TRenderElementProps) => {
  const _options = castArray<RenderNodeOptions>(options);

  for (const option of _options) {
    const {
      type,
      component: Element = DefaultElement as SlatePluginComponent,
      getNodeProps,
    } = option;

    if (element.type === type) {
      const nodeProps =
        getNodeProps?.({ attributes, element, children }) ??
        element.attributes ??
        {};

      return (
        <Element
          className={getSlateClass(type)}
          attributes={attributes}
          element={element}
          nodeProps={nodeProps}
        >
          {children}
        </Element>
      );
    }
  }
};
