import * as React from 'react';
import { DefaultElement, RenderElementProps } from 'slate-react';
import { RenderElement } from '../types/RenderElement';

/**
 * @see {@link RenderElement}
 */
export const renderElementPlugins = (
  renderElementList: (RenderElement | undefined)[]
) => {
  return (elementProps: RenderElementProps) => {
    let element;

    renderElementList.some((renderElement) => {
      element = renderElement?.(elementProps);
      return !!element;
    });
    if (element) return element;

    return <DefaultElement {...elementProps} />;
  };
};
