import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { type PlateElementProps, PlateElement } from '../components';
import { useReadOnly } from '../slate-react';
import { useEditorRef, useElement } from '../stores';
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

function ElementContent({ editor, plugin, ...props }: PlateElementProps) {
  const element = useElement();
  const readOnly = useReadOnly();

  if (isEditOnly(readOnly, plugin, 'render')) return null;

  const { children: _children } = props;
  const Component = plugin.render?.node;
  const Element = Component ?? (PlateElement as any);

  props = getRenderNodeProps({
    attributes: element.attributes as any,
    editor,
    plugin,
    props: props as any,
    readOnly,
  }) as any;

  let children = _children;

  editor.meta.pluginCache.render.belowNodes.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const withHOC = plugin.render.belowNodes!;

    // belowNodes can have hooks
    const hoc = withHOC({ ...props, key } as any);

    if (hoc && !isEditOnly(readOnly, plugin, 'render')) {
      children = hoc({ ...props, children } as any);
    }
  });

  const defaultProps = Component ? {} : { as: plugin.render?.as };

  let component: React.ReactNode = (
    <Element {...defaultProps} {...props}>
      {children}

      <BelowRootNodes {...defaultProps} {...props} />
    </Element>
  );

  editor.meta.pluginCache.render.aboveNodes.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const withHOC = plugin.render.aboveNodes!;

    // aboveNodes can have hooks
    const hoc = withHOC({ ...props, key } as any);

    if (hoc && !isEditOnly(readOnly, plugin, 'render')) {
      component = hoc({ ...props, children: component } as any);
    }
  });

  return component;
}

export function BelowRootNodes(props: any) {
  const editor = useEditorRef();
  const readOnly = useReadOnly();

  return (
    <>
      {editor.meta.pluginCache.render.belowRootNodes.map((key) => {
        const plugin = editor.getPlugin({ key });

        if (isEditOnly(readOnly, plugin, 'render')) return null;

        const Component = plugin.render.belowRootNodes!;

        return <Component key={key} {...props} />;
      })}
    </>
  );
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
  function render(props) {
    const { element, path } = props;

    return (
      <ElementProvider
        element={element}
        entry={[element, path]}
        path={path}
        scope={plugin.key}
      >
        <ElementContent editor={editor} plugin={plugin} {...(props as any)} />
      </ElementProvider>
    );
  };
