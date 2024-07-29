import React from 'react';

import { DefaultElement } from 'slate-react';

import type { PlateEditor } from '../../shared/types/PlateEditor';
import type { RenderElement } from '../../shared/types/RenderElement';
import type { TEditableProps } from '../../shared/types/slate-react/TEditableProps';

import { pipeInjectProps } from '../../shared/utils/pipeInjectProps';
import { pluginRenderElement } from './pluginRenderElement';

/** @see {@link RenderElement} */
export const pipeRenderElement = (
  editor: PlateEditor,
  renderElementProp?: TEditableProps['renderElement']
): TEditableProps['renderElement'] => {
  const renderElements: RenderElement[] = [];

  editor.plugins.forEach((plugin) => {
    if (plugin.isElement) {
      renderElements.push(pluginRenderElement(editor, plugin));
    }
  });

  return function render(nodeProps) {
    const props = pipeInjectProps(editor, nodeProps);

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
