import React from 'react';

import { DefaultElement } from 'slate-react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';
import type { PlateRenderElementProps } from '../plugin/PlateRenderElementProps';

import { useElement } from '../stores';
import { ElementProvider } from '../stores/element/useElementStore';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Function used to render an element. If the function returns undefined then
 * the next RenderElement function is called. If the function renders a JSX
 * element then that JSX element is rendered.
 */
export type RenderElement = (
  props: PlateRenderElementProps
) => React.ReactElement | undefined;

function ElementContent({
  editor,
  nodeProps,
  plugin,
}: {
  editor: PlateEditor;
  nodeProps: PlateRenderElementProps;
  plugin: AnyEditorPlatePlugin;
}) {
  const element = useElement();

  const { children: _children } = nodeProps;
  const key = plugin.key;
  const Element = plugin.render?.node ?? (DefaultElement as any);

  const aboveNodes = editor.pluginList.flatMap(
    (o) => o.render?.aboveNodes ?? []
  );
  const belowNodes = editor.pluginList.flatMap(
    (o) => o.render?.belowNodes ?? []
  );

  nodeProps = getRenderNodeProps({
    attributes: element.attributes as any,
    editor,
    plugin,
    props: nodeProps as any,
  }) as any;

  let children = _children;

  belowNodes.forEach((withHOC) => {
    const hoc = withHOC({ ...nodeProps, key } as any);

    if (hoc) {
      children = hoc({ ...nodeProps, children } as any);
    }
  });

  let component: React.ReactNode = <Element {...nodeProps}>{children}</Element>;

  aboveNodes.forEach((withHOC) => {
    const hoc = withHOC({ ...nodeProps, key } as any);

    if (hoc) {
      component = hoc({ ...nodeProps, children: component } as any);
    }
  });

  return component;
}

/**
 * Get a `Editable.renderElement` handler for `plugin.node.type`. If the type is
 * equals to the slate element type, render `plugin.render.node`. Else, return
 * `undefined` so the pipeline can check the next plugin.
 */
export const pluginRenderElement = (
  editor: PlateEditor,
  plugin: AnyEditorPlatePlugin
): RenderElement =>
  function render(nodeProps) {
    const { element } = nodeProps;

    if (element.type === plugin.node.type) {
      return (
        <ElementProvider element={element} scope={plugin.key}>
          <ElementContent
            editor={editor}
            nodeProps={nodeProps}
            plugin={plugin}
          />
        </ElementProvider>
      );
    }
  };
