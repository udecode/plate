import { TippyProps } from '@tippyjs/react';

export interface ButtonStyleProps {
  active?: boolean;
  reversed?: boolean;
  onMouseDown?: (event: any) => void;
  [key: string]: any;
}

export interface ToolbarButtonProps extends ButtonStyleProps {
  icon: any;
  tooltip?: TippyProps;
}

export interface ToolbarElementProps extends ToolbarButtonProps {
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
