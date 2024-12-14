import React from 'react';

import type { SlateEditor } from '../editor';
import type { SlatePlugin } from '../plugin';
import type { StaticComponents } from './components';
import type { RenderStaticElement, StaticElementProps } from './type';

import { PlateStaticElement } from './components/DefaultStaticElement';
import { getRenderStaticNodeProps } from './utils/getRenderStaticNodeProps';

export const getBelowNodesChildren = (
  editor: SlateEditor,
  nodeProps: StaticElementProps,
  plugin: SlatePlugin,
  children: React.ReactNode
) => {
  const belowNodes = editor.pluginList.flatMap(
    (o) => o.render?.belowNodes ?? []
  );

  return belowNodes.reduce((acc, withHOC) => {
    const hoc = withHOC({ ...nodeProps, key: plugin.key } as any);

    if (hoc) {
      return hoc({ ...nodeProps, children: acc } as any);
    }

    return acc;
  }, children);
};

export const pluginRenderStaticElement = (
  editor: SlateEditor,
  plugin: SlatePlugin,
  staticComponents?: StaticComponents
): RenderStaticElement =>
  function render(nodeProps) {
    if (nodeProps.element.type === plugin.node.type) {
      const Element = staticComponents?.[plugin.key] ?? PlateStaticElement;

      const { children } = nodeProps;

      nodeProps = getRenderStaticNodeProps({
        editor,
        plugin,
        props: nodeProps,
      });

      const wrappedChildren = getBelowNodesChildren(
        editor,
        nodeProps,
        plugin,
        children
      );

      const component: React.ReactNode = (
        <Element {...nodeProps}>{wrappedChildren}</Element>
      );

      return component;
    }
  };

/** @see {@link RenderElement} */
export const pipeRenderStaticElement = (
  editor: SlateEditor,
  staticComponents?: StaticComponents,
  renderElementProp?: RenderStaticElement
): RenderStaticElement => {
  const renderElements: RenderStaticElement[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isElement) {
      renderElements.push(
        pluginRenderStaticElement(editor, plugin, staticComponents)
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
      <PlateStaticElement attributes={props.attributes} element={props.element}>
        {props.children}
      </PlateStaticElement>
    );
  };
};
