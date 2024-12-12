import React from 'react';

import type { StaticLeafProps } from '../type';

export function PlateStaticLeaf(props: StaticLeafProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as, attributes, children, className, style, ...rest } = props;
  const Leaf = (as ?? 'span') as any;

  return (
    <Leaf className={className} style={style} {...attributes}>
      {children}
    </Leaf>
  );
}
