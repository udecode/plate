import React, { FunctionComponent } from 'react';

/**
 * HOC adding props.
 */
export const withMarkedProps: <T>(
  Component: FunctionComponent<T>,
  props: { marks: (keyof React.CSSProperties)[] }
) => FunctionComponent<any> = (Component, props) => {
  return (_props) => {
    const { leaf } = _props;

    const styles: { styles: { root: { [key: string]: any } } } = {
      styles: {
        root: {},
      },
    };

    const { marks } = props;

    marks.forEach((mark: keyof React.CSSProperties) => {
      styles.styles.root[mark] = leaf[mark];
    });

    return <Component {..._props} {...styles} />;
  };
};
