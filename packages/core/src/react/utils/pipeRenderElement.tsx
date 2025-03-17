import React from 'react';

import type { EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';

import { useNodePath } from '../hooks';
import { DefaultElement } from '../slate-react';
import { type RenderElement, pluginRenderElement } from './pluginRenderElement';

/** @see {@link RenderElement} */
export const pipeRenderElement = (
  editor: PlateEditor,
  renderElementProp?: EditableProps['renderElement']
): EditableProps['renderElement'] => {
  const renderElements: RenderElement[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isElement) {
      renderElements.push(pluginRenderElement(editor, plugin));
    }
  });

  return function render(props) {
    let element;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const path = useNodePath(props.element)!;

    renderElements.some((renderElement) => {
      element = renderElement({ ...props, path } as any);

      return !!element;
    });

    if (element) return element;
    if (renderElementProp) {
      return renderElementProp({ ...props, path } as any);
    }

    return (
      <DefaultElement attributes={props.attributes} element={props.element}>
        {props.children}
      </DefaultElement>
    );
  };
};
