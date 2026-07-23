import React from 'react';

import { type BaseEditor, getPluginByType } from '../lib';
import {
  getCompiledPlateModelBinding,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
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
    const plugin = getPluginByType(editor, props.element.type);
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
          (key) => {
            const plugin = editor.getPlugin({ key }) as any;
            const Component = plugin.render.belowRootNodes;

            return <Component key={key} {...ctxProps} />;
          }
        )}
      </PliteElement>
    );
  };
