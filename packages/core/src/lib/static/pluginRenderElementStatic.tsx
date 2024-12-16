import React from 'react';

import type { TElement } from '@udecode/slate';

import type { SlateEditor } from '../editor';
import type { AnyEditorPlugin, NodeComponents } from '../plugin';

import { PlateElementStatic } from './components/PlateElementStatic';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type RenderElementStaticProps = {
  attributes: {
    'data-slate-node': 'element';
    ref: any;
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
  };
  children: any;
  element: TElement;
};

export type RenderElementStatic = (
  props: RenderElementStaticProps
) => React.ReactElement | undefined;

export const pluginRenderElementStatic = (
  editor: SlateEditor,
  plugin: AnyEditorPlugin,
  components?: NodeComponents
): RenderElementStatic =>
  function render(nodeProps) {
    if (nodeProps.element.type === plugin.node.type) {
      const element = nodeProps.element;

      const key = plugin.key;
      const Element: any = components?.[plugin.key] ?? PlateElementStatic;

      let { children } = nodeProps;

      const aboveNodes = editor.pluginList.flatMap(
        (o) => o.render?.aboveNodes ?? []
      );
      const belowNodes = editor.pluginList.flatMap(
        (o) => o.render?.belowNodes ?? []
      );

      nodeProps = getRenderNodeStaticProps({
        attributes: element.attributes as any,
        editor,
        plugin,
        props: nodeProps as any,
      }) as any;

      belowNodes.forEach((withHOC) => {
        const hoc = withHOC({ ...nodeProps, key } as any);

        if (hoc) {
          children = hoc({ ...nodeProps, children } as any);
        }
      });

      let component: React.ReactNode = (
        <Element {...nodeProps}>{children}</Element>
      );

      aboveNodes.forEach((withHOC) => {
        const hoc = withHOC({ ...nodeProps, key } as any);

        if (hoc) {
          component = hoc({ ...nodeProps, children: component } as any);
        }
      });

      return component;
    }
  };
