'use client';

import React from 'react';
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from '@udecode/plate-common';

import { extendProps } from '@/lib/utils';

import { ToolbarButton } from './toolbar';

export const MarkToolbarButton = extendProps(ToolbarButton)<{
  nodeType: string;
  clear?: string | string[];
}>(({ clear, nodeType, ...rest }, ref) => {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props } = useMarkToolbarButton(state);

  return <ToolbarButton ref={ref} {...props} {...rest} />;
});
