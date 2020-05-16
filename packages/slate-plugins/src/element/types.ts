import { Editor } from 'slate';

export const DEFAULT_ELEMENT = 'p';

export interface ToggleBlockEditor extends Editor {
  toggleBlock: (format: string) => void;
}

export interface GetRenderElementOptions {
  type: string;
  component: any;
}

export interface RenderElementOptions {
  component?: any;
  [key: string]: any;
}
