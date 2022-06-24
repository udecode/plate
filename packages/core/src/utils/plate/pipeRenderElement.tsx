import React from 'react';
import { DefaultElement } from 'slate-react';
import { ElementProvider } from '../../atoms/index';
import { Value } from '../../slate/editor/TEditor';
import { TEditableProps } from '../../slate/types/TEditableProps';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { RenderElement } from '../../types/plate/RenderElement';
import { pipeInjectProps } from './pipeInjectProps';
import { pluginRenderElement } from './pluginRenderElement';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = <V extends Value>(
  editor: PlateEditor<V>,
  renderElementProp?: TEditableProps<V>['renderElement']
): TEditableProps<V>['renderElement'] => {
  const renderElements: { renderElement: RenderElement; key: string }[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isElement) {
      renderElements.push({
        renderElement: pluginRenderElement(editor, plugin),
        key: plugin.key,
      });
    }
  });

  return (nodeProps) => {
    const props = pipeInjectProps<V>(editor, nodeProps);

    let element;

    for (const { renderElement, key } of renderElements) {
      element = renderElement(props as any);

      if (element) {
        return (
          <ElementProvider element={props.element} scope={key}>
            {element}
          </ElementProvider>
        );
      }
    }

    if (renderElementProp) {
      return renderElementProp(props);
    }

    return <DefaultElement {...props} />;
  };
};
