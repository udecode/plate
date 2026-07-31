import React from 'react';

import { useEditorReadOnly } from '@platejs/plite-react';
import { useClaimEditableDOMCommit } from '@platejs/plite-react/internal';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { type PlateElementProps, PlateElement } from '../components';
import { createPluginContext } from '../plugin/createPluginContext.internal';
import { useEditor } from '../stores';
import { ElementProvider } from '../stores/element/useElementStore';
import { getRenderNodeProps } from './getRenderNodeProps';

/**
 * Function used to render an element. If the function returns undefined then
 * the next RenderElement function is called. If the function renders a JSX
 * element then that JSX element is rendered.
 */
export type RenderElement = (
  props: PlateElementProps
) => React.ReactElement<any> | undefined;

function ElementContent({
  editor,
  plugin,
  pluginContext,
  ...props
}: PlateElementProps & { pluginContext?: Record<string, unknown> }) {
  const readOnly = useEditorReadOnly();

  useClaimEditableDOMCommit();

  if (isEditOnly(readOnly, plugin, 'render')) return null;

  const { children: _children } = props;
  const Component = plugin.render?.node;
  const Element = Component ?? (PlateElement as any);

  props = getRenderNodeProps({
    editor,
    plugin: plugin as AnyEditorPlatePlugin,
    pluginContext,
    props: props as any,
    readOnly,
  }) as any;

  let children = _children;

  getPlateRuntime(editor).pluginCache.render.belowNodes.forEach(
    (pluginName) => {
      const wrapperContext = createPluginContext(editor, pluginName);
      const { plugin } = wrapperContext;
      const withHOC = plugin.render.belowNodes!;

      // belowNodes can have hooks
      const hoc = withHOC({ ...props, ...wrapperContext, pluginName } as any);

      if (hoc && !isEditOnly(readOnly, plugin, 'render')) {
        children = hoc({ ...props, children } as any);
      }
    }
  );

  const defaultProps = Component ? {} : { as: plugin.render?.as };

  let component: React.ReactNode = (
    <Element {...defaultProps} {...props}>
      {children}

      <BelowRootNodes {...defaultProps} {...props} />
    </Element>
  );

  getPlateRuntime(editor).pluginCache.render.aboveNodes.forEach(
    (pluginName) => {
      const wrapperContext = createPluginContext(editor, pluginName);
      const { plugin } = wrapperContext;
      const withHOC = plugin.render.aboveNodes!;

      // aboveNodes can have hooks
      const hoc = withHOC({ ...props, ...wrapperContext, pluginName } as any);

      if (hoc && !isEditOnly(readOnly, plugin, 'render')) {
        component = hoc({ ...props, children: component } as any);
      }
    }
  );

  return component;
}

export function BelowRootNodes({ ...props }: any) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  return (
    <>
      {getPlateRuntime(editor).pluginCache.render.belowRootNodes.map(
        (pluginName) => {
          const pluginContext = createPluginContext(editor, pluginName);
          const { plugin } = pluginContext;

          if (isEditOnly(readOnly, plugin, 'render')) return null;

          const Component = plugin.render.belowRootNodes!;

          return <Component key={pluginName} {...props} {...pluginContext} />;
        }
      )}
    </>
  );
}

/**
 * Get a `Editable.renderElement` handler for `plugin.type`. If the type is
 * equals to the plite element type, render `plugin.render.node`. Else, return
 * `undefined` so the pipeline can check the next plugin.
 */
export const pluginRenderElement = (
  editor: PlateEditor,
  plugin: AnyEditorPlatePlugin
): RenderElement => {
  const pluginContext = createPluginContext(editor, plugin);

  return function render(props) {
    const { element, path } = props;

    return (
      <ElementProvider
        element={element}
        entry={[element, path]}
        path={path}
        scope={plugin.name}
      >
        <ElementContent
          editor={editor}
          plugin={plugin}
          pluginContext={pluginContext}
          {...(props as any)}
        />
      </ElementProvider>
    );
  };
};
