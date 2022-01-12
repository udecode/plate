import React, { FunctionComponent } from 'react';

export const withHOC = <T,>(
  HOC: FunctionComponent<any>,
  Component: FunctionComponent<T>
): FunctionComponent<T> => (props: T) => (
  <HOC>
    <Component {...props} />
  </HOC>
);
