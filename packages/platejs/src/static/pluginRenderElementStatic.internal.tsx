import React from 'react';

import { failInvariant } from '../internal/failInvariant';
import {
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
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps.internal';

export type PliteRenderElement = (
  props: RenderElementProps
) => React.ReactNode | undefined;

export const pluginRenderElementStatic = (
  editor: Editor,
  plugin: AnyBasePluginPortal | AnyPluginBase
): PliteRenderElement =>
  function render(initialNodeProps) {
    let nodeProps = initialNodeProps;
    const nodeComponent = plugin.component;
    const Component =
      nodeComponent && typeof nodeComponent !== 'string'
        ? nodeComponent
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

    getPlateRuntime(editor).pluginCache.slots.wrapNodeChildren.forEach(
      (name) => {
        const wrapperPlugin =
          getCompiledPlatePlugin(editor, name) ??
          failInvariant('Expected value to be defined');
        const wrapperContext = createPluginContext(editor, wrapperPlugin);
        const renderBelow = wrapperPlugin.slots.wrapNodeChildren;
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
          children = Reflect.apply(hoc, undefined, [
            { ...nodeProps, children },
          ]);
        }
      }
    );

    const defaultProps =
      typeof nodeComponent === 'string' ? { as: nodeComponent } : {};

    let renderedNode: React.ReactNode = (
      <Element {...defaultProps} {...nodeProps}>
        {children}

        {getPlateRuntime(editor).pluginCache.slots.afterNodeChildren.map(
          (name) => {
            const innerPlugin =
              getCompiledPlatePlugin(editor, name) ??
              failInvariant('Expected value to be defined');
            const innerComponent = innerPlugin.slots.afterNodeChildren;
            const pluginContext = createPluginContext(editor, innerPlugin);

            if (typeof innerComponent !== 'function') return null;

            const rendered = Reflect.apply(innerComponent, undefined, [
              {
                ...defaultProps,
                ...nodeProps,
                ...pluginContext,
              },
            ]) as React.ReactNode;

            return <React.Fragment key={name}>{rendered}</React.Fragment>;
          }
        )}
      </Element>
    );

    getPlateRuntime(editor).pluginCache.slots.wrapNode.forEach((name) => {
      const wrapperPlugin =
        getCompiledPlatePlugin(editor, name) ??
        failInvariant('Expected value to be defined');
      const wrapperContext = createPluginContext(editor, wrapperPlugin);
      const renderAbove = wrapperPlugin.slots.wrapNode;
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
        renderedNode = Reflect.apply(hoc, undefined, [
          { ...nodeProps, children: renderedNode },
        ]);
      }
    });

    return renderedNode;
  };
