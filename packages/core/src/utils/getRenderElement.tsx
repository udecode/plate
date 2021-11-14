import React from 'react';
import { DefaultElement } from 'slate-react';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePlugin/PlatePluginComponent';
import { RenderElement } from '../types/plugins/PlatePlugin/RenderElement';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Get a `Editable.renderElement` handler for `options.type`.
 * If the type is equals to the slate element type, render `options.component`.
 * Else, return `undefined` so the pipeline can check the next plugin.
 */
export const getRenderElement = (
  editor: PlateEditor,
  {
    key,
    type,
    component: Element = DefaultElement as PlatePluginComponent,
    getNodeProps,
  }: PlatePlugin
): RenderElement => (props) => {
  const injectParentComponents = editor.plugins.flatMap(
    (o) => o.injectParentComponent ?? []
  );
  const injectChildComponents = editor.plugins.flatMap(
    (o) => o.injectChildComponent ?? []
  );

  const { element, children: _children } = props;

  if (element.type === type) {
    const nodeProps = getRenderNodeProps({
      attributes: element.attributes,
      getNodeProps,
      props,
      type,
    });

    let children = _children;

    injectChildComponents.forEach((withHOC) => {
      const hoc = withHOC({ ...nodeProps, key });

      if (hoc) {
        children = hoc({ ...nodeProps, children });
      }
    });

    let component: JSX.Element | null = (
      <Element {...nodeProps}>{children}</Element>
    );

    injectParentComponents.forEach((withHOC) => {
      const hoc = withHOC({ ...nodeProps, key });

      if (hoc) {
        component = hoc({ ...nodeProps, children: component });
      }
    });

    return component;
  }
};
