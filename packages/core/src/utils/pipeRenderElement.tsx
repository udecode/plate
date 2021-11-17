import React from 'react';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderElementProps } from '../types/PlateRenderElementProps';
import { RenderElement } from '../types/RenderElement';
import { pipeInjectProps } from './pipeInjectProps';
import { pluginRenderElement } from './pluginRenderElement';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = (
  editor: PlateEditor,
  editableProps?: EditableProps
): EditableProps['renderElement'] => {
  const renderElements: RenderElement[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isElement) {
      renderElements.push(pluginRenderElement(editor, plugin));
    }
  });

  return (nodeProps) => {
    const props = pipeInjectProps<PlateRenderElementProps>(editor, nodeProps);

    let element;

    renderElements.some((renderElement) => {
      element = renderElement(props as any);
      return !!element;
    });

    if (element) return element;

    if (editableProps?.renderElement) {
      return editableProps.renderElement(props);
    }

    return <DefaultElement {...props} />;
  };
};
