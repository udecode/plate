import { Editor } from 'slate';
import { RenderElementProps } from 'slate-react';

/**
 * Function used to render an element.
 * If the function returns undefined then the next RenderElement function is called.
 * If the function renders a JSX element then that JSX element is rendered.
 */
export type RenderElement = (
  editor: Editor
) => (props: RenderElementProps) => JSX.Element | undefined;
