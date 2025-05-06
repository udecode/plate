import React from 'react';

import type { SlateEditor } from '../editor';
import type { NodeComponents } from '../plugin';

import { SlateElement } from './components/slate-nodes';
import {
  type SlateRenderElement,
  pluginRenderElementStatic,
} from './pluginRenderElementStatic';
import { getRenderNodeStaticProps } from './utils';

export const pipeRenderElementStatic = (
  editor: SlateEditor,
  {
    components,
    renderElement: renderElementProp,
  }: {
    components: NodeComponents;
    renderElement?: SlateRenderElement;
  }
): SlateRenderElement => {
  const renderElements: SlateRenderElement[] = [];

  editor.pluginList.forEach((plugin) => {
    if (plugin.node.isElement) {
      renderElements.push(
        pluginRenderElementStatic(editor, plugin, components)
      );
    }
  });

  return function render(props) {
    let element;

    renderElements.some((renderElement) => {
      element = renderElement(props as any);

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

    return <SlateElement {...ctxProps}>{props.children}</SlateElement>;
  };
};
