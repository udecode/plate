import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface ToolbarElementProps extends ToolbarButtonProps {
  type: string;

  inactiveType?: string;
}
