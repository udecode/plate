import React from 'react';

import type { StaticLeafProps } from '@udecode/plate-common';

import { PlateStaticLeaf } from '@udecode/plate-common';

export const CodeStaticLeaf = ({ children, ...props }: StaticLeafProps) => {
  return (
    <PlateStaticLeaf {...props}>
      <code className="whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm">
        {children}
      </code>
    </PlateStaticLeaf>
  );
};
