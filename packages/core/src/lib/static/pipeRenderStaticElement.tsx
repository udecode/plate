import React from 'react';

import type { Path } from 'slate';

import { findNode } from '@udecode/slate';
import clsx from 'clsx';

import type { SlateEditor } from '../editor';
import type { StaticComponents } from './components';
import type { RenderStaticElement, StaticElementProps } from './type';

import { type SlatePlugin, getEditorPlugin } from '../plugin';
import { getSlateClass, pipeInjectNodeProps } from '../utils';
import { getPluginNodeProps } from '../utils/getPluginNodeProps';
import { PlateStaticElement } from './components/DefaultStaticElement';

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
    ...(plugin ? getEditorPlugin(editor, plugin) : {}),
    className: clsx(getSlateClass(plugin?.node.type), className),
  };

  nodeProps = pipeInjectNodeProps(
    editor,
    nodeProps,
    (node) => findNode(editor, { match: (n) => n === node })?.[1] as Path
  );

  if (nodeProps.style && Object.keys(nodeProps.style).length === 0) {
    delete nodeProps.style;
  }

  return nodeProps;
};

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
