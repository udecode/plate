import { ToggleMarkPlugin } from '@udecode/plate-common';
import { WithPlatePlugin } from '@udecode/plate-core';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface MarkToolbarButtonProps
  extends ToolbarButtonProps,
    Pick<WithPlatePlugin, 'type'>,
    Pick<ToggleMarkPlugin, 'clear'> {}
