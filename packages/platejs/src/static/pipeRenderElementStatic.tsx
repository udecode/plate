import React from 'react';

import { failInvariant } from '../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePluginByType,
} from '../internal/plugin/compilePlateModel';
import type { AnyPluginBase, Editor } from '../lib';
import { PliteElement } from './components/plite-nodes';
import {
  type PliteRenderElement,
  pluginRenderElementStatic,
} from './pluginRenderElementStatic';
import { getStaticRenderRuntime, type StaticRenderers } from './renderers';
import { getRenderNodeStaticProps } from './utils';

export const pipeRenderElementStatic = (
  editor: Editor,
  {
    renderElement: renderElementProp,
    renderers,
  }: {
    renderElement?: PliteRenderElement;
    renderers?: StaticRenderers;
  } = {}
): PliteRenderElement =>
  function render(props) {
    const plugin = getCompiledPlatePluginByType(
      editor,
      props.element.type
    ) as unknown as AnyPluginBase | undefined;
    const renderPlugin =
      plugin &&
      (getStaticRenderRuntime(editor, renderers).plugins[plugin.name] ?? {
        ...plugin,
        render: {},
        inject: {},
      });
    const binding = plugin
      ? getCompiledPlateModelBinding(editor, plugin)
      : undefined;

    if (renderPlugin && binding?.kind === 'element') {
      return pluginRenderElementStatic(editor, renderPlugin, renderers)(props);
    }

    if (renderElementProp) {
      return renderElementProp(props);
    }

    const ctxProps = getRenderNodeStaticProps({
      renderers,
      editor,
      path: props.path,
      props: { ...props } as any,
    });

    return (
      <PliteElement {...ctxProps}>
        {props.children}

        {getStaticRenderRuntime(
          editor,
          renderers
        ).pluginCache.render.belowRootNodes.map((name) => {
          const innerPlugin = (getStaticRenderRuntime(editor, renderers)
            .plugins[name] ??
            failInvariant('Expected value to be defined')) as any;
          const Component = innerPlugin.render.belowRootNodes;

          return <Component key={name} {...ctxProps} />;
        })}
      </PliteElement>
    );
  };
