import React from 'react';

import {
  type AnyBasePlugin,
  type BaseEditor,
  type RenderElementProps,
  getEditorPlugin,
} from '../lib';
import { getPlateRuntime } from '../internal/plugin/compilePlateModel';

import { PliteElement } from './components/plite-nodes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderElement = (
  props: RenderElementProps
) => React.ReactNode | undefined;

export const pluginRenderElementStatic = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): PliteRenderElement =>
  function render(nodeProps) {
    const Component = getPlateRuntime(editor).components[plugin.key] as any;
    const Element = Component ?? PliteElement;

    let { children } = nodeProps;

    // biome-ignore lint/style/noParameterAssign: Intentional props accumulation pattern
    nodeProps = getRenderNodeStaticProps({
      editor,
      path: nodeProps.path,
      plugin,
      props: nodeProps as any,
    }) as any;

    getPlateRuntime(editor).pluginCache.render.belowNodes.forEach((key) => {
      const wrapperPlugin = editor.getPlugin({ key });
      const wrapperContext = getEditorPlugin(editor, wrapperPlugin);
      const hoc = wrapperPlugin.render.belowNodes!({
        ...nodeProps,
        ...wrapperContext,
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

        {getPlateRuntime(editor).pluginCache.render.belowRootNodes.map(
          (key) => {
            const plugin = editor.getPlugin({ key }) as any;
            const Component = plugin.render.belowRootNodes;
            const pluginContext = getEditorPlugin(editor, plugin);

            return (
              <Component
                key={key}
                {...defaultProps}
                {...nodeProps}
                {...pluginContext}
              />
            );
          }
        )}
      </Element>
    );

    getPlateRuntime(editor).pluginCache.render.aboveNodes.forEach((key) => {
      const wrapperPlugin = editor.getPlugin({ key });
      const wrapperContext = getEditorPlugin(editor, wrapperPlugin);
      const hoc = wrapperPlugin.render.aboveNodes!({
        ...nodeProps,
        ...wrapperContext,
        key,
      } as any);

      if (hoc) {
        component = hoc({ ...nodeProps, children: component } as any);
      }
    });

    return component;
  };
