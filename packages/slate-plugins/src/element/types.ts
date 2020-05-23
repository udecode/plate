import { Editor } from 'slate';

export const DEFAULT_ELEMENT = 'p';

export interface ToggleTypeEditor extends Editor {
  /**
   * Toggle the type of the selected nodes.
   */
  toggleType: (activeType: string, defaultType?: string) => void;
}

export interface GetRenderElementOptions {
  /**
   * Type of the element.
   */
  type: string;
  /**
   * React component to render the element.
   */
  component: any;
  /**
   * Options passed to the component as props.
   */
  [key: string]: any;
}

export interface RenderElementOptions {
  /**
   * React component to render the element.
   */
  component?: any;
}
