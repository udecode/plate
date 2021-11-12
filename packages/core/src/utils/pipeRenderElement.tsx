import React from 'react';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderElementProps } from '../types/PlateRenderElementProps';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { RenderElement } from '../types/plugins/PlatePlugin/RenderElement';
import { getRenderElement } from './getRenderElement';
import { injectOverrideProps } from './injectOverrideProps';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = (
  editor: PlateEditor,
  {
    plugins = [],
    editableProps,
  }: { plugins: PlatePlugin[]; editableProps?: EditableProps }
): EditableProps['renderElement'] => {
  const renderElements: RenderElement[] = [];

  plugins.forEach((plugin) => {
    if (plugin.isElement) {
      renderElements.push(getRenderElement(editor, plugin));
    }
  });

  return (_props) => {
    const props = injectOverrideProps<PlateRenderElementProps>(editor, {
      props: _props,
      plugins,
    });

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
