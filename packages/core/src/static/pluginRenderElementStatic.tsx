import React from 'react';

import type {
  AnyResolvedBasePlugin,
  BaseEditor,
  RenderElementProps,
} from '../lib';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
import { createPluginContext } from '../lib/plugin/createPluginContext.internal';

import { PliteElement } from './components/plite-nodes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderElement = (
  props: RenderElementProps
) => React.ReactNode | undefined;

export const pluginRenderElementStatic = (
  editor: BaseEditor,
  plugin: AnyResolvedBasePlugin
): PliteRenderElement =>
  function render(nodeProps) {
    const Component = getPlateRuntime(editor).components[plugin.name] as any;
    const Element = Component ?? PliteElement;

    let { children } = nodeProps;

    // biome-ignore lint/style/noParameterAssign: Intentional props accumulation pattern
    nodeProps = getRenderNodeStaticProps({
      editor,
      path: nodeProps.path,
      plugin,
      props: nodeProps as any,
    }) as any;

    getPlateRuntime(editor).pluginCache.render.belowNodes.forEach(
      (pluginName) => {
        const wrapperPlugin = getCompiledPlatePlugin(editor, pluginName)!;
        const wrapperContext = createPluginContext(editor, wrapperPlugin);
        const renderBelow = wrapperPlugin.render.belowNodes;
        const hoc =
          typeof renderBelow === 'function'
            ? Reflect.apply(renderBelow, undefined, [
                {
                  ...nodeProps,
                  ...wrapperContext,
                  pluginName,
                },
              ])
            : undefined;

        if (typeof hoc === 'function') {
          children = Reflect.apply(hoc, undefined, [
            { ...nodeProps, children },
          ]);
        }
      }
    );

    const defaultProps = Component ? {} : { as: plugin.render?.as };

    let component: React.ReactNode = (
      <Element {...defaultProps} {...nodeProps}>
        {children}

        {getPlateRuntime(editor).pluginCache.render.belowRootNodes.map(
          (pluginName) => {
            const plugin = getCompiledPlatePlugin(editor, pluginName)!;
            const Component = plugin.render.belowRootNodes;
            const pluginContext = createPluginContext(editor, plugin);

            if (typeof Component !== 'function') return null;

            return Reflect.apply(Component, undefined, [
              {
                ...defaultProps,
                ...nodeProps,
                ...pluginContext,
                key: pluginName,
              },
            ]) as React.ReactNode;
          }
        )}
      </Element>
    );

    getPlateRuntime(editor).pluginCache.render.aboveNodes.forEach(
      (pluginName) => {
        const wrapperPlugin = getCompiledPlatePlugin(editor, pluginName)!;
        const wrapperContext = createPluginContext(editor, wrapperPlugin);
        const renderAbove = wrapperPlugin.render.aboveNodes;
        const hoc =
          typeof renderAbove === 'function'
            ? Reflect.apply(renderAbove, undefined, [
                {
                  ...nodeProps,
                  ...wrapperContext,
                  pluginName,
                },
              ])
            : undefined;

        if (typeof hoc === 'function') {
          component = Reflect.apply(hoc, undefined, [
            { ...nodeProps, children: component },
          ]);
        }
      }
    );

    return component;
  };
