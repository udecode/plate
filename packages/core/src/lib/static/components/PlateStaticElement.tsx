import React from 'react';

import type { StaticElementProps } from '../type';

export const PlateStaticElement = (props: StaticElementProps) => {
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
