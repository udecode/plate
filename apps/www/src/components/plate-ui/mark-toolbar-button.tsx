'use client';

import React from 'react';
import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from '@udecode/plate-common';

import { ToolbarButton, ToolbarButtonProps } from '@/components/ui/toolbar';

export interface MarkToolbarButtonProps
  extends Pick<ToolbarButtonProps, 'tooltip' | 'children'> {
  nodeType: string;
  clear?: string | string[];
}

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export function MarkToolbarButton({
  clear,
  nodeType,
  ...props
}: MarkToolbarButtonProps) {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props: buttonProps } = useMarkToolbarButton(state);

  return <ToolbarButton {...buttonProps} {...props} />;
}
