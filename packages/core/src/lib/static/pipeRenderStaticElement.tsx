import React from 'react';

import clsx from 'clsx';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';
import type { RenderStaticElement, StaticElementProps } from './type';

import { getSlateClass, pipeInjectNodeProps } from '../utils';
import { getPluginNodeProps } from '../utils/getPluginNodeProps';
import { DefaultStaticElement } from './components/DefaultStaticElement';

export const getRenderStaticNodeProps = ({
  editor,
  plugin,
  props,
}: {
  editor: SlateEditor;
  props: StaticElementProps;
  plugin?: SlatePlugin;
}): StaticElementProps => {
  props = getPluginNodeProps(props, plugin);

  const { className } = props;

  let nodeProps = {
    ...props,
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(editor, nodeProps);

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};

export const pluginRenderStaticElement = (
  editor: SlateEditor,
  plugin: SlatePlugin
): RenderStaticElement =>
  function render(nodeProps) {
    if (nodeProps.element.type === plugin.node.type) {
      const Element = plugin.node.staticComponent ?? DefaultStaticElement;

      nodeProps = getRenderStaticNodeProps({
        editor,
        plugin,
        props: nodeProps,
      });

      const component = <Element {...nodeProps} />;

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
