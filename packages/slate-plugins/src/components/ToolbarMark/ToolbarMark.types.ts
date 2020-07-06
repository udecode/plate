import { ToolbarButtonProps } from '../ToolbarButton/index';

export interface ToolbarMarkProps extends ToolbarButtonProps {
  clear?: string | string[];
  type: string;
}
