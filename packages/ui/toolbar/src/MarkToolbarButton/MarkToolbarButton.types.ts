import { PlatePluginOptions } from '@udecode/plate-core';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface MarkToolbarButtonProps
  extends ToolbarButtonProps,
    Pick<PlatePluginOptions, 'type' | 'clear'> {}
