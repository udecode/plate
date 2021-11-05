import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface BlockToolbarButtonProps extends ToolbarButtonProps {
  type: string;

  inactiveType?: string;
}
