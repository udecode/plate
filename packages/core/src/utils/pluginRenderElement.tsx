import React, { ReactNode } from 'react';
import { Value } from '@udecode/slate';
import { DefaultElement } from 'slate-react';

import { ElementProvider } from '../stores/element';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugin/PlatePlugin';
import { RenderElement } from '../types/RenderElement';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderElement` handler for `options.type`.
 * If the type is equals to the slate element type, render `options.component`.
 * Else, return `undefined` so the pipeline can check the next plugin.
 */
export const pluginRenderElement = <V extends Value>(
  editor: PlateEditor<V>,
  { key, type, component: _component, props }: PlatePlugin<{}, V>
): RenderElement =>
  function render(nodeProps) {
    const { element, children: _children } = nodeProps;

    if (element.type === type) {
      const Element = _component ?? DefaultElement;

      const injectAboveComponents = editor.plugins.flatMap(
        (o) => o.inject?.aboveComponent ?? []
      );
      const injectBelowComponents = editor.plugins.flatMap(
        (o) => o.inject?.belowComponent ?? []
      );

      nodeProps = getRenderNodeProps({
        attributes: element.attributes as any,
        nodeProps: nodeProps as any,
        props,
        type: type!,
      }) as any;

      let children = _children;

      injectBelowComponents.forEach((withHOC) => {
        const hoc = withHOC({ ...nodeProps, key } as any);

        if (hoc) {
          children = hoc({ ...nodeProps, children } as any);
        }
      });

      let component: ReactNode = <Element {...nodeProps}>{children}</Element>;

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
