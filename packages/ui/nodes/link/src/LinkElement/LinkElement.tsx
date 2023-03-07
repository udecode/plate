import React from 'react';
import { Value } from '@udecode/plate-common';
import { Link, TLinkElement } from '@udecode/plate-link';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { getLinkElementStyles } from './LinkElement.styles';

export const LinkElement = (props: StyledElementProps<Value, TLinkElement>) => {
  const { as, ...rootProps } = props;

  const { root } = getLinkElementStyles(props);

  return <Link.Root {...rootProps} css={root.css} />;
};
