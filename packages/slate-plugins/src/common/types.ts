export interface ToolbarElementProps {
  icon: any;
  height?: string;
  reversed?: boolean;
  [key: string]: any;
}

export interface ToolbarFormatProps extends ToolbarElementProps {
  format: string;
  onClick?: (event: any) => void;
}
