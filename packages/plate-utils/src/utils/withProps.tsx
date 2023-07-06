import React, { FunctionComponent } from 'react';

/**
 * HOC adding props.
 */
export const withProps: <T>(
  Component: FunctionComponent<T>,
  props: Partial<T>
) => FunctionComponent<any> = (Component, props) =>
  function component(_props) {
    return <Component {..._props} {...props} />;
  };
