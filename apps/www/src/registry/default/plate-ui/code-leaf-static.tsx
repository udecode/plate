import React from 'react';

import type { PlateLeafStaticProps } from '@udecode/plate-common';

import { PlateLeafStatic } from '@udecode/plate-common';

export const CodeLeafStatic = ({ children, ...props }: PlateLeafStaticProps) => {
  return (
    <PlateLeafStatic {...props}>
      <code className="whitespace-pre-wrap rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm">
        {children}
      </code>
    </PlateLeafStatic>
  );
};
