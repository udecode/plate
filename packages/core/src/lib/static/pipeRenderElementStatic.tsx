import React from 'react';

import type { SlateEditor } from '../editor';
import type { NodeComponents } from '../plugin';

import { SlateElement } from './components/SlateElement';
import {
  type SlateRenderElement,
  pluginRenderElementStatic,
} from './pluginRenderElementStatic';

export const pipeRenderElementStatic = (
  editor: SlateEditor,
  {
    components,
    renderElement: renderElementProp,
  }: {
    components: NodeComponents;
    renderElement?: SlateRenderElement;
  }
): SlateRenderElement => {
  const renderElements: SlateRenderElement[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isElement) {
      renderElements.push(
        pluginRenderElementStatic(editor, plugin, components)
      );
    }
  });

  return function render(props) {
    let element;

    renderElements.some((renderElement) => {
      element = renderElement(props as any);

      return !!element;
    });

    if (element) return element;
    if (renderElementProp) {
      return renderElementProp(props);
    }

    return (
      <SlateElement
        attributes={props.attributes}
        element={props.element}
        {...({} as any)}
      >
        {props.children}
      </SlateElement>
    );
  };
};
