import { ToolbarButtonProps } from '../../components/ToolbarButton';

export interface ToolbarMarkProps extends ToolbarButtonProps {
  clear?: string | string[];
  type: string;
}
