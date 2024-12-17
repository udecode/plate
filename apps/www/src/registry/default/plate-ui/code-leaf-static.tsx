import React from 'react';

import type { SlateLeafProps } from '@udecode/plate-common';

import { SlateLeaf } from '@udecode/plate-common';

export const CodeLeafStatic = ({ children, ...props }: SlateLeafProps) => {
  return (
    <SlateLeaf {...props}>
      <code className="whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm">
        {children}
      </code>
    </SlateLeaf>
  );
};
