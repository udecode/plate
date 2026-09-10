import React from 'react';

import { failInvariant } from '../internal/failInvariant';
import { getCompiledPlateModelBinding } from '../internal/plugin/compilePlateModel';
import type {
  AnyBasePluginPortal,
  AnyPluginBase,
  Editor,
  RenderElementProps,
} from '../lib';
import { createPluginContext } from '../lib/plugin/createPluginContext.internal';
import { PliteElement } from './components/plite-nodes';
import { getStaticRenderRuntime, type StaticRenderers } from './renderers';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps';

export type PliteRenderElement = (
  props: RenderElementProps
) => React.ReactNode | undefined;

export const pluginRenderElementStatic = (
  editor: Editor,
  plugin: AnyBasePluginPortal | AnyPluginBase,
  renderers?: StaticRenderers
): PliteRenderElement =>
  function render(initialNodeProps) {
    let nodeProps = initialNodeProps;
    const elementType = getCompiledPlateModelBinding(
      editor,
      plugin
    )?.elementType;
    const Component = elementType
      ? (getStaticRenderRuntime(editor, renderers).components[
          elementType
        ] as any)
      : undefined;
    const Element = Component ?? PliteElement;

    let { children } = nodeProps;

    // Intentional props accumulation pattern.
    nodeProps = getRenderNodeStaticProps({
      renderers,
      editor,
      path: nodeProps.path,
      plugin,
      props: nodeProps as any,
    });

    getStaticRenderRuntime(
      editor,
      renderers
    ).pluginCache.render.belowNodes.forEach((name) => {
      const wrapperPlugin =
        getStaticRenderRuntime(editor, renderers).plugins[name] ??
        failInvariant('Expected value to be defined');
      const wrapperContext = createPluginContext(editor, wrapperPlugin.name);
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

        {getStaticRenderRuntime(
          editor,
          renderers
        ).pluginCache.render.belowRootNodes.map((name) => {
          const innerPlugin =
            getStaticRenderRuntime(editor, renderers).plugins[name] ??
            failInvariant('Expected value to be defined');
          const innerComponent = innerPlugin.render.belowRootNodes;
          const pluginContext = createPluginContext(editor, innerPlugin.name);

          if (typeof innerComponent !== 'function') return null;

          return Reflect.apply(innerComponent, undefined, [
            {
              ...defaultProps,
              ...nodeProps,
              ...pluginContext,
              key: name,
            },
          ]) as React.ReactNode;
        })}
      </Element>
    );

    getStaticRenderRuntime(
      editor,
      renderers
    ).pluginCache.render.aboveNodes.forEach((name) => {
      const wrapperPlugin =
        getStaticRenderRuntime(editor, renderers).plugins[name] ??
        failInvariant('Expected value to be defined');
      const wrapperContext = createPluginContext(editor, wrapperPlugin.name);
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
