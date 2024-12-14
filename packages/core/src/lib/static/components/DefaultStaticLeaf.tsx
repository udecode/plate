import React from 'react';

import type { StaticLeafProps } from '../type';

export function PlateStaticLeaf(props: StaticLeafProps) {
  const { as, attributes, children, className, leaf, text, ...rest } = props;

  const Leaf = (as ?? 'span') as any;

  const {
    api,
    editor,
    getOption,
    getOptions,
    plugin,
    setOption,
    setOptions,
    tf,
    type,
    ...restProps
  } = rest as any;

  return (
    <Leaf className={className} {...attributes} {...restProps}>
      {children}
    </Leaf>
  );
}
