import React from 'react';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderElementProps } from '../types/PlateRenderElementProps';
import { RenderElement } from '../types/plugins/PlatePlugin/RenderElement';
import { getRenderElement } from './getRenderElement';
import { pipeOverrideProps } from './pipeOverrideProps';

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
      renderElements.push(getRenderElement(editor, plugin));
    }
  });

  return (_props) => {
    const props = pipeOverrideProps<PlateRenderElementProps>(editor, _props);

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
