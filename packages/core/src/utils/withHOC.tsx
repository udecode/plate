import React, { FunctionComponent } from 'react';

export const withHOC = <T,>(
  HOC: FunctionComponent<any>,
  Component: FunctionComponent<T>,
  hocProps?: any
): FunctionComponent<T> => (props: T) => (
  <HOC {...hocProps}>
    <Component {...props} />
  </HOC>
);
