import React, { FunctionComponent } from 'react';
import { TElement, TText } from '@udecode/plate-common';
import castArray from 'lodash/castArray';
import { CSSProp, CSSProperties } from 'styled-components';

/**
 * HOC mapping element/leaf props to component styles
 */
export const withStyledProps = <T extends { element: TElement; leaf: TText }>(
  Component: FunctionComponent<any>,
  {
    elementProps = {},
    leafProps = {},
  }: {
    elementProps?: {
      [key: string]: keyof CSSProperties | (keyof CSSProperties)[];
    };
    leafProps?: {
      [key: string]: keyof CSSProperties | (keyof CSSProperties)[];
    };
  }
): FunctionComponent<any> => (_props: T) => {
  const { element, leaf } = _props;

  const styles: { root: CSSProp } = {
    root: {},
  };

  Object.keys(elementProps).forEach((nodeProp) => {
    const cssPropKeys = castArray(elementProps[nodeProp]);
    cssPropKeys.forEach((key) => {
      styles.root[key] = element[nodeProp];
    });
  });

  Object.keys(leafProps).forEach((nodeProp) => {
    const cssPropKeys = castArray(leafProps[nodeProp]);
    cssPropKeys.forEach((key) => {
      styles.root[key] = leaf[nodeProp];
    });
  });

  return <Component {..._props} styles={styles} />;
};
