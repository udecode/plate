import * as React from 'react';
import { RenderElementProps } from 'slate-react';
import { GetRenderElementOptions } from '../types';

/**
 * Get generic renderElement from a possible type + component
 */
export const getRenderElement = ({
  type,
  component: Component,
  ...options
}: GetRenderElementOptions) => ({
  attributes,
  ...props
}: RenderElementProps) => {
  if (props.element.type === type) {
    return (
      <Component
        attributes={{ 'data-slate-type': type, ...attributes }}
        {...props}
        {...options}
      />
    );
  }
};

/**
 * Get generic renderElement from a list of possible types + components
 */
export const getRenderElements = (options: GetRenderElementOptions[]) => ({
  attributes,
  ...props
}: RenderElementProps) => {
  for (const { type, component: Component } of options) {
    if (props.element.type === type) {
      return (
        <Component
          attributes={{ 'data-slate-type': type, ...attributes }}
          {...props}
        />
      );
    }
  }
};
