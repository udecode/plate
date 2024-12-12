import React from 'react';

import type { StaticElementProps } from '../type';

export const PlateStaticElement = (props: StaticElementProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as, attributes, children, className, nodeProps, style, ...rest } =
    props;

  const Element = (as ?? 'div') as any;

  return (
    <Element {...attributes} {...nodeProps} className={className} style={style}>
      {children}
    </Element>
  );
};
