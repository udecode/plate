import * as React from 'react';
import { castArray } from 'lodash';
import { DefaultElement } from 'slate-react';
import { ElementToProps } from '../types/NodeToProps';
import { RenderElementPropsWithAttributes } from '../types/RenderElementPropsWithAttributes';
import { RenderNodeOptions } from '../types/RenderNodeOptions';
import { getSlateClass } from './getSlateClass';

export interface GetRenderElementOptions
  extends RenderNodeOptions,
    ElementToProps {}

/**
 * Get a `renderElement` handler for a list of types.
 * If the given `type` is equals to the slate element type, render the given `component`.
 */
export const getRenderElement = (
  options: GetRenderElementOptions | GetRenderElementOptions[]
) => ({ attributes, element, children }: RenderElementPropsWithAttributes) => {
  const _options = castArray<GetRenderElementOptions>(options);

  for (const option of _options) {
    const { type, component: Element = DefaultElement, nodeToProps } = option;

    if (element.type === type) {
      const htmlAttributes =
        nodeToProps?.({ attributes, element, children }) ?? element?.attributes;

      return (
        <Element
          attributes={attributes}
          htmlAttributes={htmlAttributes}
          element={element}
          className={getSlateClass(type)}
        >
          {children}
        </Element>
      );
    }
  }
};
