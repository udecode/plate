import React from 'react';

import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';
import { useMarkToolbarButtonProps } from '@/lib/@/useMarkToolbarButtonProps';

export interface MarkToolbarButtonProps extends ToolbarButtonProps {
  nodeType: string;
  clear?: string | string[];
}

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export function MarkToolbarButton({
  id,
  clear,
  nodeType,
  ...props
}: MarkToolbarButtonProps) {
  const markToolbarButton = useMarkToolbarButtonProps({ id, clear, nodeType });

  return <ToolbarButton {...markToolbarButton} {...props} />;
}
