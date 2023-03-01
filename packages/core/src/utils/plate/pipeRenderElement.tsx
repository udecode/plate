import React from 'react';
import { DefaultElement } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { RenderElement } from '../../types/plate/RenderElement';
import { TEditableProps } from '../../types/TEditableProps';
import { pipeInjectProps } from './pipeInjectProps';
import { pluginRenderElement } from './pluginRenderElement';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = <V extends Value>(
  editor: PlateEditor<V>,
  renderElementProp?: TEditableProps<V>['renderElement']
): TEditableProps<V>['renderElement'] => {
  const renderElements: RenderElement[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isElement) {
      renderElements.push(pluginRenderElement(editor, plugin));
    }
  });

  return (nodeProps) => {
    const props = pipeInjectProps<V>(editor, nodeProps);

    let element;

    renderElements.some((renderElement) => {
      element = renderElement(props as any);
      return !!element;
    });

    if (element) return element;

    if (renderElementProp) {
      return renderElementProp(props);
    }

    return <DefaultElement {...props} />;
  };
};
