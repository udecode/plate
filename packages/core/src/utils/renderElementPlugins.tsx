import * as React from 'react';
import { Editor } from 'slate';
import { DefaultElement, RenderElementProps } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { RenderElement } from '../types/SlatePlugin/RenderElement';

/**
 * @see {@link RenderElement}
 */
export const renderElementPlugins = (
  editor: Editor,
  renderElementList: (RenderElement | undefined)[]
): EditableProps['renderElement'] => (elementProps: RenderElementProps) => {
  let element;

  renderElementList.some((renderElement) => {
    element = renderElement?.(editor)(elementProps);
    return !!element;
  });
  if (element) return element;

  return <DefaultElement {...elementProps} />;
};
