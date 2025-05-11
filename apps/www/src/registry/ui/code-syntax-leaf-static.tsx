import * as React from 'react';

import { type SlateLeafProps, SlateLeaf } from '@udecode/plate';

export function CodeSyntaxLeafStatic(props: SlateLeafProps) {
  const tokenClassName = props.leaf.className as string;

  return <SlateLeaf className={tokenClassName} {...props} />;
}
