import React from 'react';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';
import type { RenderStaticElement } from './type';

import { DefaultStaticElement } from './components/DefaultStaticElement';

const pluginRenderStaticElement = (
  _: SlateEditor,
  plugin: SlatePlugin
): RenderStaticElement =>
  function render(nodeProps) {
    if (nodeProps.element.type === plugin.node.type) {
      const { children, element } = nodeProps;

      const Element = plugin.node.staticComponent ?? DefaultStaticElement;

      const component = (
        <Element
          attributes={{
            ...nodeProps.attributes,
          }}
          element={element}
        >
          {children}
        </Element>
      );

      return component;
    }
  };

/** @see {@link RenderElement} */
export const pipeRenderStaticElement = (
  editor: SlateEditor,
  renderElementProp?: RenderStaticElement
): RenderStaticElement => {
  const renderElements: RenderStaticElement[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isElement) {
      renderElements.push(pluginRenderStaticElement(editor, plugin));
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
      <DefaultStaticElement
        attributes={props.attributes}
        element={props.element}
      >
        {props.children}
      </DefaultStaticElement>
    );
  };
};
