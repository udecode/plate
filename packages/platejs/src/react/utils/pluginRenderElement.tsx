import React from 'react';

import type { Path } from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { RenderElementProps } from '../../lib';
import { type PlateNodeProps, PlateElement } from '../components';
import type { Editor } from '../editor/Editor';
import { useEditorReadOnly, useClaimEditableDOMCommit } from '../plite-react';
import { createPluginContext } from '../plugin/createPluginContext.internal';
import type { AnyResolvedPlatePlugin } from '../plugin/PlatePlugin';
import { useEditor } from '../stores';
import { ElementProvider } from '../stores/element/useElementStore';
import { getRenderNodeProps } from './getRenderNodeProps';

export type RenderElement = (
  props: PlateNodeProps & RenderElementProps & { path: Path }
) => React.ReactElement<any> | undefined;

function ElementContent({
  editor,
  plugin,
  pluginContext,
  ...initialProps
}: (PlateNodeProps & RenderElementProps & { path: Path }) & {
  pluginContext?: Record<string, unknown>;
}) {
  let props = initialProps;
  const readOnly = useEditorReadOnly();

  useClaimEditableDOMCommit();

  if (isEditOnly(readOnly, plugin, 'render')) return null;

  const { children: _children } = props;
  const Component = plugin.render?.node;
  const Element = Component ?? (PlateElement as any);

  props = getRenderNodeProps({
    editor,
    plugin,
    pluginContext,
    props: props as any,
    readOnly,
  });
  const { path: _path, ...nodeProps } = props;

  let children = _children;

  getPlateRuntime(editor).pluginCache.render.belowNodes.forEach((name) => {
    const wrapperContext = createPluginContext(editor, name);
    const { plugin: innerPlugin } = wrapperContext;
    const renderBelow =
      innerPlugin.render.belowNodes ??
      failInvariant('Expected value to be defined');
    const wrapperProps = { ...nodeProps, renderPath: _path };

    // belowNodes can have hooks
    const wrap = renderBelow({ ...wrapperProps, ...wrapperContext });

    if (wrap && !isEditOnly(readOnly, innerPlugin, 'render')) {
      children = wrap({ ...wrapperProps, children });
    }
  });

  const defaultProps = Component ? {} : { as: plugin.render?.as };

  let component: React.ReactNode = (
    <Element {...defaultProps} {...nodeProps}>
      {children}

      <BelowRootNodes {...defaultProps} {...nodeProps} />
    </Element>
  );

  getPlateRuntime(editor).pluginCache.render.aboveNodes.forEach((name) => {
    const wrapperContext = createPluginContext(editor, name);
    const { plugin: innerPlugin2 } = wrapperContext;
    const renderAbove =
      innerPlugin2.render.aboveNodes ??
      failInvariant('Expected value to be defined');
    const matchProps = {
      editor,
      element: nodeProps.element,
      renderPath: _path,
    };

    if (typeof renderAbove !== 'function') {
      if (renderAbove.match && !renderAbove.match(matchProps)) return;
      if (isEditOnly(readOnly, innerPlugin2, 'render')) return;

      const wrapperProps = { ...nodeProps, renderPath: _path };
      const InnerComponent = renderAbove.component;

      component = (
        <InnerComponent {...wrapperProps} {...(wrapperContext as any)}>
          {component}
        </InnerComponent>
      );

      return;
    }
    const wrapperProps = { ...nodeProps, renderPath: _path };

    // aboveNodes can have hooks
    const wrap = renderAbove({ ...wrapperProps, ...wrapperContext });

    if (wrap && !isEditOnly(readOnly, innerPlugin2, 'render')) {
      component = wrap({ ...wrapperProps, children: component });
    }
  });

  return component;
}

export function BelowRootNodes({ ...props }: any) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  return (
    <>
      {getPlateRuntime(editor).pluginCache.render.belowRootNodes.map((name) => {
        const pluginContext = createPluginContext(editor, name);
        const { plugin } = pluginContext;

        if (isEditOnly(readOnly, plugin, 'render')) return null;

        const Component =
          plugin.render.belowRootNodes ??
          failInvariant('Expected value to be defined');

        return <Component {...props} {...pluginContext} key={name} />;
      })}
    </>
  );
}

/**
 * Get an `Editable.renderElement` handler for one plugin-owned element type.
 */
export const pluginRenderElement = (
  editor: Editor,
  plugin: AnyResolvedPlatePlugin
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
          {...props}
          editor={editor}
          plugin={plugin}
          pluginContext={pluginContext}
        />
      </ElementProvider>
    );
  };
};
