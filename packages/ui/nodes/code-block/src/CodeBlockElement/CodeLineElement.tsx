import React from 'react';
import { Value } from '@udecode/plate-common';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { getCodeLineElementStyles } from './CodeLineElement.styles';

export const CodeLineElement = <V extends Value>(
  props: StyledElementProps<V>
) => {
  const { attributes, children, nodeProps } = props;

  const rootProps = getRootProps(props);
  const { root } = getCodeLineElementStyles(props);

  return (
    <div
      {...attributes}
      css={root.css}
      className={root.className}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </div>
  );
};
