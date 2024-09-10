import React from 'react';

import type { TEditableProps } from '@udecode/slate-react';

import { DefaultElement } from 'slate-react';

import type { PlateEditor } from '../editor/PlateEditor';

import { pipeInjectNodeProps } from '../../lib';
import { type RenderElement, pluginRenderElement } from './pluginRenderElement';

/** @see {@link RenderElement} */
export const pipeRenderElement = (
  editor: PlateEditor,
  renderElementProp?: TEditableProps['renderElement']
): TEditableProps['renderElement'] => {
  const renderElements: RenderElement[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isElement) {
      renderElements.push(pluginRenderElement(editor, plugin));
    }
  });

  return function render(nodeProps) {
    const props = pipeInjectNodeProps(editor, nodeProps);

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
