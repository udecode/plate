import * as React from 'react';

import { type PliteElementProps, PliteElement } from 'platejs/static';

export function BlockquoteElementStatic(props: PliteElementProps) {
  return (
    <PliteElement
      as="blockquote"
      className="my-1 border-l-2 pl-6 italic"
      {...props}
    />
  );
}
