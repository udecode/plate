export interface ToolbarElementProps {
  icon: any;
  height?: string;
  reversed?: boolean;
  [key: string]: any;
}

export interface ToolbarFormatProps extends ToolbarElementProps {
  format: string;
  onMouseDown?: (event: any) => void;
}
