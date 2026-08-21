import React from 'react';

import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getCompiledPlatePluginByType,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
import type { AnyPluginBase, BaseEditor } from '../lib';
import { PliteElement } from './components/plite-nodes';
import {
  type PliteRenderElement,
  pluginRenderElementStatic,
} from './pluginRenderElementStatic';
import { getRenderNodeStaticProps } from './utils';

export const pipeRenderElementStatic = (
  editor: BaseEditor,
  {
    renderElement: renderElementProp,
  }: {
    renderElement?: PliteRenderElement;
  } = {}
): PliteRenderElement =>
  function render(props) {
    const plugin = getCompiledPlatePluginByType(
      editor,
      props.element.type
    ) as unknown as AnyPluginBase | undefined;
    const binding = plugin
      ? getCompiledPlateModelBinding(editor, plugin)
      : undefined;

    if (plugin && binding?.kind === 'element') {
      return pluginRenderElementStatic(editor, plugin)(props as any);
    }

    if (renderElementProp) {
      return renderElementProp(props);
    }

    const ctxProps = getRenderNodeStaticProps({
      editor,
      path: props.path,
      props: { ...props } as any,
    }) as any;

    return (
      <PliteElement {...ctxProps}>
        {props.children}

        {getPlateRuntime(editor).pluginCache.render.belowRootNodes.map(
          (name) => {
            const plugin = getCompiledPlatePlugin(editor, name)! as any;
            const Component = plugin.render.belowRootNodes;

            return <Component key={name} {...ctxProps} />;
          }
        )}
      </PliteElement>
    );
  };
