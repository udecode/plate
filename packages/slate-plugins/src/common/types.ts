export interface ToolbarElementProps {
  icon: any;
  height?: string;
  reversed?: boolean;
}

export interface ToolbarFormatProps extends ToolbarElementProps {
  format: string;
  onClick?: (event: any) => void;
}
