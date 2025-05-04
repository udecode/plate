import React from 'react';

import type { EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';

import { PlateElement } from '../components';
import { useNodePath } from '../hooks';
import { getRenderNodeProps } from './getRenderNodeProps';
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

    const ctxProps = getRenderNodeProps({
      editor,
      props: { ...props, path } as any,
    }) as any;

    return <PlateElement {...ctxProps}>{props.children}</PlateElement>;
  };
};
