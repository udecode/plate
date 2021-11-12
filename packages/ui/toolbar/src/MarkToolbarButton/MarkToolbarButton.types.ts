import { ToggleMarkPlugin } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface MarkToolbarButtonProps
  extends ToolbarButtonProps,
    Pick<PlatePlugin<{}, ToggleMarkPlugin>, 'type' | 'clear'> {}
