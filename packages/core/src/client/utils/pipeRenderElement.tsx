import React from 'react';
import { Value } from '@udecode/slate';
import { DefaultElement } from 'slate-react';

import { PlateEditor } from '../../types/PlateEditor';
import { RenderElement } from '../../types/RenderElement';
import { TEditableProps } from '../../types/slate-react/TEditableProps';
import { pipeInjectProps } from '../../utils/pipeInjectProps';
import { pluginRenderElement } from './pluginRenderElement';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = <V extends Value>(
  editor: PlateEditor<V>,
  renderElementProp?: TEditableProps['renderElement']
): TEditableProps['renderElement'] => {
  const renderElements: RenderElement[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isElement) {
      renderElements.push(pluginRenderElement(editor, plugin));
    }
  });

  return function render(nodeProps) {
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
