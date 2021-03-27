import * as React from 'react';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { SPRenderElementProps } from '../types/SPRenderElementProps';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['renderElement'] => {
  const renderElements = plugins.flatMap(
    (plugin) => plugin.renderElement?.(editor) ?? []
  );

  return (elementProps) => {
    let element;

    renderElements.some((renderElement) => {
      element = renderElement(elementProps as SPRenderElementProps);
      return !!element;
    });
    if (element) return element;

    return <DefaultElement {...elementProps} />;
  };
};
