import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface ToolbarMarkProps extends ToolbarButtonProps {
  clear?: string | string[];
  type: string;
}
