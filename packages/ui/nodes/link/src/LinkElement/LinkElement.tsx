import React from 'react';
import { Value } from '@udecode/plate-core';
import { TLinkElement } from '@udecode/plate-link';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { getLinkElementStyles } from './LinkElement.styles';

export const LinkElement = <V extends Value>(
  props: StyledElementProps<V, TLinkElement>
) => {
  const { attributes, children, nodeProps, element } = props;

  const rootProps = getRootProps(props);
  const { root } = getLinkElementStyles(props);

  return (
    <a
      {...attributes}
      href={element.url}
      css={root.css}
      className={root.className}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </a>
  );
};
