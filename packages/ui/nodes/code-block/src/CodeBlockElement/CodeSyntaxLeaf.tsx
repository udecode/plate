import React from 'react';
import { PlateLeafProps } from '@udecode/plate-styled-components';

export function CodeSyntaxLeaf({ attributes, children, leaf }: PlateLeafProps) {
  return (
    <span {...attributes}>
      <span
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={`prism-token token ${leaf.tokenType}`}
      >
        {children}
      </span>
    </span>
  );
}
