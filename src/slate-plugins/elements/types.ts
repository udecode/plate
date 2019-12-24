import { Editor } from 'slate';

export interface ToggleBlockEditor extends Editor {
  toggleBlock: (format: string) => void;
}

export interface GetRenderElementOptions {
  type: string;
  component: any;
}

export interface RenderElementOptions {
  component?: any;
}
