import { ToolbarButtonProps } from '../ToolbarButton/index';

export interface ToolbarElementProps extends ToolbarButtonProps {
  type: string;

  inactiveType?: string;
}
