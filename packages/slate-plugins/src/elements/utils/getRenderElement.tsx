import React from 'react';
import { RenderElementProps } from 'slate-react';
import { GetRenderElementOptions, RenderElementOptions } from '../types';

/**
 * get generic renderElement with a custom component
 */
export const getRenderElement = ({
  type,
  component,
}: GetRenderElementOptions) => ({
  component: Component = component,
}: RenderElementOptions = {}) => (props: RenderElementProps) => {
  if (props.element.type === type) {
    return <Component {...props} />;
  }
};
