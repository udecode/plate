import React from 'react';
import castArray from 'lodash/castArray';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { RenderElement } from '../types/PlatePlugin/RenderElement';
import { PlateRenderElementProps } from '../types/PlateRenderElementProps';
import { TRenderElementProps } from '../types/TRenderElementProps';
import { getRenderElement } from './getRenderElement';
import { pipeOverrideProps } from './pipeOverrideProps';

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
    if (plugin.isElement && plugin.key) {
      renderElements.push(getRenderElement(editor, plugin.key));
    }
  });

  const propsOverriders = plugins.flatMap((plugin) =>
    castArray(plugin.overrideProps).flatMap((cb) => cb?.(editor) ?? [])
  );

  return (renderElementProps) => {
    const props: PlateRenderElementProps = {
      ...pipeOverrideProps(
        renderElementProps as TRenderElementProps,
        propsOverriders
      ),
      editor,
      plugins,
    };

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
