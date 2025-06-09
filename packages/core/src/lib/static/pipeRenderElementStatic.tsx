import React from 'react';

import type { SlateEditor } from '../editor';

import { SlateElement } from './components/slate-nodes';
import {
  type SlateRenderElement,
  pluginRenderElementStatic,
} from './pluginRenderElementStatic';
import { getRenderNodeStaticProps } from './utils';

export const pipeRenderElementStatic = (
  editor: SlateEditor,
  {
    renderElement: renderElementProp,
  }: {
    renderElement?: SlateRenderElement;
  } = {}
): SlateRenderElement => {
  return function render(props) {
    let element;

    editor.meta.pluginCache.node.isElement.some((key) => {
      const plugin = editor.getPlugin({ key });

      element = pluginRenderElementStatic(editor, plugin)(props as any);

      return !!element;
    });

    if (element) return element;
    if (renderElementProp) {
      return renderElementProp(props);
    }

    const ctxProps = getRenderNodeStaticProps({
      editor,
      props: { ...props } as any,
    }) as any;

    return (
      <SlateElement {...ctxProps}>
        {props.children}

        {editor.meta.pluginCache.render.belowRootNodes.map((key) => {
          const plugin = editor.getPlugin({ key }) as any;
          const Component = plugin.render.belowRootNodes;

          return <Component key={key} {...ctxProps} />;
        })}
      </SlateElement>
    );
  };
};
