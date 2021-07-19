import { PlatePluginOptions } from '@udecode/plate-core';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface ToolbarMarkProps
  extends ToolbarButtonProps,
    Pick<PlatePluginOptions, 'type' | 'clear'> {}
