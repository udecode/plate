import React from 'react';
import { useSuggestingButton } from '@udecode/plate-suggestion';

import {
  ToolbarButtonOld,
  ToolbarButtonProps,
} from '@/plate/toolbar/ToolbarButtonOld';

export function PlateSuggestionToolbarButton(props: ToolbarButtonProps) {
  const buttonProps = useSuggestingButton(props as any);

  return <ToolbarButtonOld {...(buttonProps as any)} />;
}
