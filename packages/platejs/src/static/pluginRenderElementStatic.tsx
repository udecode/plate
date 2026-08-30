import React from 'react';

import { failInvariant } from '../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
import type {
  AnyBasePluginPortal,
  AnyPluginBase,
  Editor,
  RenderElementProps,
} from '../lib';
import { createPluginContext } from '../lib/plugin/createPluginContext.internal';
import { PliteElement } from './components/plite-nodes';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderElement = (
  props: RenderElementProps
) => React.ReactNode | undefined;

export const pluginRenderElementStatic = (
  editor: Editor,
  plugin: AnyBasePluginPortal | AnyPluginBase
): PliteRenderElement =>
  function render(initialNodeProps) {
    let nodeProps = initialNodeProps;
    const elementType = getCompiledPlateModelBinding(
      editor,
      plugin
    )?.elementType;
    const Component = elementType
      ? (getPlateRuntime(editor).components[elementType] as any)
      : undefined;
    const Element = Component ?? PliteElement;

    let { children } = nodeProps;

    // Intentional props accumulation pattern.
    nodeProps = getRenderNodeStaticProps({
      editor,
      path: nodeProps.path,
      plugin,
      props: nodeProps as any,
    });

    getPlateRuntime(editor).pluginCache.render.belowNodes.forEach((name) => {
      const wrapperPlugin =
        getCompiledPlatePlugin(editor, name) ??
        failInvariant('Expected value to be defined');
      const wrapperContext = createPluginContext(editor, wrapperPlugin);
      const renderBelow = wrapperPlugin.render.belowNodes;
      const hoc =
        typeof renderBelow === 'function'
          ? Reflect.apply(renderBelow, undefined, [
              {
                ...nodeProps,
                ...wrapperContext,
              },
            ])
          : undefined;

      if (typeof hoc === 'function') {
        children = Reflect.apply(hoc, undefined, [{ ...nodeProps, children }]);
      }
    });

    const defaultProps = Component ? {} : { as: plugin.render?.as };

    let component: React.ReactNode = (
      <Element {...defaultProps} {...nodeProps}>
        {children}

        {getPlateRuntime(editor).pluginCache.render.belowRootNodes.map(
          (name) => {
            const innerPlugin =
              getCompiledPlatePlugin(editor, name) ??
              failInvariant('Expected value to be defined');
            const innerComponent = innerPlugin.render.belowRootNodes;
            const pluginContext = createPluginContext(editor, innerPlugin);

            if (typeof innerComponent !== 'function') return null;

            return Reflect.apply(innerComponent, undefined, [
              {
                ...defaultProps,
                ...nodeProps,
                ...pluginContext,
                key: name,
              },
            ]) as React.ReactNode;
          }
        )}
      </Element>
    );

    getPlateRuntime(editor).pluginCache.render.aboveNodes.forEach((name) => {
      const wrapperPlugin =
        getCompiledPlatePlugin(editor, name) ??
        failInvariant('Expected value to be defined');
      const wrapperContext = createPluginContext(editor, wrapperPlugin);
      const renderAbove = wrapperPlugin.render.aboveNodes;
      const hoc =
        typeof renderAbove === 'function'
          ? Reflect.apply(renderAbove, undefined, [
              {
                ...nodeProps,
                ...wrapperContext,
              },
            ])
          : undefined;

      if (typeof hoc === 'function') {
        component = Reflect.apply(hoc, undefined, [
          { ...nodeProps, children: component },
        ]);
      }
    });

    return component;
  };
