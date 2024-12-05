import React from 'react';

import type { TElement } from '@udecode/slate';
import type { TEditableProps, TRenderElementProps } from '@udecode/slate-react';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';

import { DefaultStaticElement } from './PlateStatic';

export type RenderElement = (
  props: TRenderElementProps
) => React.ReactElement | undefined;

export interface StaticElementProps<T extends TElement = TElement> {
  attributes?: Record<string, any>;
  children?: React.ReactNode;
  element?: T;
}

const pluginRenderStaticElement = (
  editor: SlateEditor,
  plugin: SlatePlugin
): RenderElement =>
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
  renderElementProp?: TEditableProps['renderElement']
): TEditableProps['renderElement'] => {
  const renderElements: RenderElement[] = [];

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
