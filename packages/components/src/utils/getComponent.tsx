import React, { FunctionComponent } from 'react';

/**
 * Get component with additional props.
 */
export const getComponent: <T>(
  Component: FunctionComponent<T>,
  props: Partial<T>
) => FunctionComponent<any> = (Component, props) => (_props) => (
  <Component {..._props} {...props} />
);
