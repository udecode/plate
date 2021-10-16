import * as React from 'react';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { pipeOverrideProps } from './pipeOverrideProps';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = (
  editor: SPEditor,
  plugins: PlatePlugin[] = []
): EditableProps['renderElement'] => {
  const renderElements = plugins.flatMap(
    (plugin) => plugin.renderElement?.(editor) ?? []
  );

  const propsOverriders = plugins.flatMap(
    (plugin) => plugin.overrideProps?.(editor) ?? []
  );

  return (renderElementProps) => {
    const props = pipeOverrideProps(renderElementProps, propsOverriders);

    let element;

    renderElements.some((renderElement) => {
      element = renderElement(props as any);
      return !!element;
    });

    if (element) return element;

    return <DefaultElement {...props} />;
  };
};
