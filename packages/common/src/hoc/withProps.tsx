import React, { FunctionComponent } from 'react';

/**
 * HOC adding props.
 */
export const withProps: <T>(
  Component: FunctionComponent<T>,
  props: Partial<T>
) => FunctionComponent<any> = (Component, props) => (_props) => (
  <Component {..._props} {...props} />
);
