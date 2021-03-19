import { SlatePluginOptions } from '@udecode/slate-plugins-core';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface ToolbarMarkProps
  extends ToolbarButtonProps,
    Pick<SlatePluginOptions, 'type' | 'clear'> {}
