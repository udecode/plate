'use client';

import * as React from 'react';

interface FrameworkDocsProps extends React.HTMLAttributes<HTMLDivElement> {
  data: string;
}

export function FrameworkDocs({ ...props }: FrameworkDocsProps) {
  // TODO: Implement framework docs loading without contentlayer
  return (
    <div>
      <p>Framework documentation for {props.data} will be displayed here.</p>
    </div>
  );
}
