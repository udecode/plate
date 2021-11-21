import React from 'react';
import { DefaultElement } from 'slate-react';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { RenderElement } from '../types/RenderElement';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderElement` handler for `options.type`.
 * If the type is equals to the slate element type, render `options.component`.
 * Else, return `undefined` so the pipeline can check the next plugin.
 */
export const pluginRenderElement = (
  editor: PlateEditor,
  { key, type, component: _component, props }: PlatePlugin
): RenderElement => (nodeProps) => {
  const Element = _component ?? DefaultElement;

  const injectAboveComponents = editor.plugins.flatMap(
    (o) => o.inject?.aboveComponent ?? []
  );
  const injectBelowComponents = editor.plugins.flatMap(
    (o) => o.inject?.belowComponent ?? []
  );

  const { element, children: _children } = nodeProps;

  if (element.type === type) {
    nodeProps = getRenderNodeProps({
      attributes: element.attributes,
      nodeProps,
      props,
      type,
    });

    let children = _children;

    injectBelowComponents.forEach((withHOC) => {
      const hoc = withHOC({ ...nodeProps, key });

      if (hoc) {
        children = hoc({ ...nodeProps, children });
      }
    });

    let component: JSX.Element | null = (
      <Element {...nodeProps}>{children}</Element>
    );

    injectAboveComponents.forEach((withHOC) => {
      const hoc = withHOC({ ...nodeProps, key });

      if (hoc) {
        component = hoc({ ...nodeProps, children: component });
      }
    });

    return component;
  }
};
