'use client';

import * as React from 'react';

import type { Style } from '@/registry/registry-styles';

interface StyleWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  styleName?: Style['name'];
}

export function StyleWrapper({ children, styleName }: StyleWrapperProps) {
  if (!styleName) {
    return <>{children}</>;
  }

  return null;
}
