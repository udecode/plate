import React from 'react';

import { type BasePlateEditor, getPluginByType } from '../lib';
import { PliteElement } from './components/plite-nodes';
import {
  type SlateRenderElement,
  pluginRenderElementStatic,
} from './pluginRenderElementStatic';
import { getRenderNodeStaticProps } from './utils';

export const pipeRenderElementStatic = (
  editor: BasePlateEditor,
  {
    renderElement: renderElementProp,
  }: {
    renderElement?: SlateRenderElement;
  } = {}
): SlateRenderElement =>
  function render(props) {
    const plugin = getPluginByType(editor, props.element.type);

    if (plugin?.node.isElement) {
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

        {editor.meta.pluginCache.render.belowRootNodes.map((key) => {
          const plugin = editor.getPlugin({ key }) as any;
          const Component = plugin.render.belowRootNodes;

          return <Component key={key} {...ctxProps} />;
        })}
      </PliteElement>
    );
  };
