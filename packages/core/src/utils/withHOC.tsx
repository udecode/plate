import React, { FunctionComponent } from 'react';

export const withHOC = <T,>(
  HOC: FunctionComponent<any>,
  Component: FunctionComponent<T>,
  hocProps?: any
): FunctionComponent<T> =>
  function hoc(props: T) {
    return (
      <HOC {...hocProps}>
        <Component {...(props as any)} />
      </HOC>
    );
  };
