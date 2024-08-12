import React from 'react';

import { DefaultElement } from 'slate-react';

import type { PlateEditor } from '../../lib';
import type { AnyEditorPlugin } from '../../lib/plugin/types/PlatePlugin';
import type { PlateRenderElementProps } from '../../lib/plugin/types/PlateRenderElementProps';

import { getRenderNodeProps } from '../../lib/utils/getRenderNodeProps';
import { ElementProvider } from '../stores/element/useElementStore';

/**
 * Function used to render an element. If the function returns undefined then
 * the next RenderElement function is called. If the function renders a JSX
 * element then that JSX element is rendered.
 */
export type RenderElement = (
  props: PlateRenderElementProps
) => React.ReactElement | undefined;

/**
 * Get a `Editable.renderElement` handler for `options.type`. If the type is
 * equals to the slate element type, render `options.component`. Else, return
 * `undefined` so the pipeline can check the next plugin.
 */
export const pluginRenderElement = (
  editor: PlateEditor,
  plugin: AnyEditorPlugin
): RenderElement =>
  function render(nodeProps) {
    const { component: _component, key } = plugin;
    const { children: _children, element } = nodeProps;

    if (element.type === plugin.type) {
      const Element = _component ?? DefaultElement;

      const injectAboveComponents = editor.pluginList.flatMap(
        (o) => o.inject?.aboveComponent ?? []
      );
      const injectBelowComponents = editor.pluginList.flatMap(
        (o) => o.inject?.belowComponent ?? []
      );

      nodeProps = getRenderNodeProps({
        attributes: element.attributes as any,
        nodeProps: nodeProps as any,
        plugin,
      }) as any;
      nodeProps.plugin = plugin;

      let children = _children;

      injectBelowComponents.forEach((withHOC) => {
        const hoc = withHOC({ ...nodeProps, key } as any);

        if (hoc) {
          children = hoc({ ...nodeProps, children } as any);
        }
      });

      let component: React.ReactNode = (
        <Element {...nodeProps}>{children}</Element>
      );

      injectAboveComponents.forEach((withHOC) => {
        const hoc = withHOC({ ...nodeProps, key } as any);

        if (hoc) {
          component = hoc({ ...nodeProps, children: component } as any);
        }
      });

      return (
        <ElementProvider element={element} scope={key}>
          {component}
        </ElementProvider>
      );
    }
  };
