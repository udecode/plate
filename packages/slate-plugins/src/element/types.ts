import { Editor } from 'slate';

export const DEFAULT_ELEMENT = 'p';

export interface ToggleBlockEditor extends Editor {
  toggleBlock: (format: string) => void;
}

export interface GetRenderElementOptions {
  /**
   * Type of the element
   */
  type: string;
  /**
   * React component to render the element
   */
  component: any;
  /**
   * Options passed to the component as props
   */
  [key: string]: any;
}

export interface RenderElementOptions {
  component?: any;
  [key: string]: any;
}
