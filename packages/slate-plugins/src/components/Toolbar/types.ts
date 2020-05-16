export interface ToolbarElementProps {
  icon: any;
  height?: string;
  reversed?: boolean;
  type?: string;
  [key: string]: any;
}

export interface ToolbarBlockProps extends ToolbarElementProps {
  type: string;
  onMouseDown?: (event: any) => void;
}

export interface ToolbarCustomProps extends ToolbarElementProps {
  onMouseDown?: (event: any) => void;
}
