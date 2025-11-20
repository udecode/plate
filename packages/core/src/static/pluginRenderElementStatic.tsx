import React from 'react';

import type { AnyEditorPlugin, RenderElementProps, SlateEditor } from '../lib';

import { SlateElement } from './components/slate-nodes';
import { getPluginDataAttributes } from './utils';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type SlateRenderElement = (
  props: RenderElementProps
) => React.ReactElement<any> | undefined;

export const pluginRenderElementStatic = (
  editor: SlateEditor,
  plugin: AnyEditorPlugin
): SlateRenderElement =>
  function render(nodeProps) {
    const element = nodeProps.element;

    const Component = editor.meta.components?.[plugin.key] as any;
    const Element = Component ?? SlateElement;

    let { children } = nodeProps;

    const dataAttributes = getPluginDataAttributes(editor, plugin, element);

    // biome-ignore lint/style/noParameterAssign: Intentional props accumulation pattern
    nodeProps = getRenderNodeStaticProps({
      attributes: {
        ...(element.attributes as any),
        ...dataAttributes,
      },
      editor,
      node: element,
      plugin,
      props: nodeProps as any,
    }) as any;

    editor.meta.pluginCache.render.belowNodes.forEach((key) => {
      const hoc = editor.getPlugin({ key }).render.belowNodes!({
        ...nodeProps,
        key,
      } as any);

      if (hoc) {
        children = hoc({ ...nodeProps, children } as any);
      }
    });

    const defaultProps = Component ? {} : { as: plugin.render?.as };

    let component: React.ReactNode = (
      <Element {...defaultProps} {...nodeProps}>
        {children}

        {editor.meta.pluginCache.render.belowRootNodes.map((key) => {
          const plugin = editor.getPlugin({ key }) as any;
          const Component = plugin.render.belowRootNodes;

          return <Component key={key} {...defaultProps} {...nodeProps} />;
        })}
      </Element>
    );

    editor.meta.pluginCache.render.aboveNodes.forEach((key) => {
      const hoc = editor.getPlugin({ key }).render.aboveNodes!({
        ...nodeProps,
        key,
      } as any);

      if (hoc) {
        component = hoc({ ...nodeProps, children: component } as any);
      }
    });

    return component;
  };
