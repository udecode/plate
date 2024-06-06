'use client';

import * as React from 'react';

import type { Style } from '@/registry/styles';

import { useConfig } from '@/hooks/use-config';

interface StyleWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  styleName?: Style['name'];
}

export function StyleWrapper({ children, styleName }: StyleWrapperProps) {
  const [config] = useConfig();

  if (!styleName || config.style === styleName) {
    return <>{children}</>;
  }

  return null;
}
