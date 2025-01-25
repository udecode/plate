import React from 'react';

import type { SlateEditor } from '../editor';
import type { AnyEditorPlugin, NodeComponents } from '../plugin';
import type { RenderElementProps } from '../types/RenderElementProps';

import { SlateElement } from './components/SlateElement';
import { getPluginDataAttributes } from './utils';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type SlateRenderElement = (
  props: RenderElementProps
) => React.ReactElement | undefined;

export const pluginRenderElementStatic = (
  editor: SlateEditor,
  plugin: AnyEditorPlugin,
  components?: NodeComponents
): SlateRenderElement =>
  function render(nodeProps) {
    if (nodeProps.element.type === plugin.node.type) {
      const element = nodeProps.element;

      const key = plugin.key;
      const Element: any = components?.[plugin.key] ?? SlateElement;

      let { children } = nodeProps;

      const aboveNodes = editor.pluginList.flatMap(
        (o) => o.render?.aboveNodes ?? []
      );
      const belowNodes = editor.pluginList.flatMap(
        (o) => o.render?.belowNodes ?? []
      );

      const dataAttributes = getPluginDataAttributes(editor, plugin, element);

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

      belowNodes.forEach((withHOC) => {
        const HOC = withHOC({ ...nodeProps, key } as any);

        if (HOC) {
          children = <HOC {...nodeProps}>{children}</HOC>;
        }
      });

      let component: React.ReactNode = (
        <Element {...nodeProps}>{children}</Element>
      );

      aboveNodes.forEach((withHOC) => {
        const HOC = withHOC({ ...nodeProps, key } as any);

        if (HOC) {
          component = <HOC {...nodeProps}>{component}</HOC>;
        }
      });

      return component;
    }
  };
