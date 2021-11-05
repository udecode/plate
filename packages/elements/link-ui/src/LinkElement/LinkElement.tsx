import React from 'react';
import { LinkNodeData } from '@udecode/plate-link';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { getLinkElementStyles } from './LinkElement.styles';

export const LinkElement = (props: StyledElementProps<LinkNodeData>) => {
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
