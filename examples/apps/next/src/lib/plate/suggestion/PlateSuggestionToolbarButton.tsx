import React from 'react';
import { useSuggestingButton } from '@udecode/plate-suggestion';
import { ToolbarButton, ToolbarButtonProps } from '../toolbar/ToolbarButton';

export function PlateSuggestionToolbarButton(props: ToolbarButtonProps) {
  const buttonProps = useSuggestingButton(props as any);

  return <ToolbarButton {...(buttonProps as any)} />;
}
