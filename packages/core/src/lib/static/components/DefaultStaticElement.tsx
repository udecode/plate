import React from 'react';

import type { StaticElementProps } from '../type';

export const PlateStaticElement = (props: StaticElementProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    as,
    attributes,
    children,
    className,
    element,
    nodeProps,
    style,
    ...rest
  } = props;

  // Remove after fixing the type
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  // eslint-disable-next-line prettier/prettier
  const { api, editor, getOption, getOptions, plugin, setOption, setOptions,tf,type, ...restProps } = rest;

  const Element = (as ?? 'div') as any;

  return (
    <Element
      {...attributes}
      {...nodeProps}
      {...restProps}
      className={className}
      style={style}
    >
      {children}
    </Element>
  );
};
