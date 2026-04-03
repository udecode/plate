/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';

import { type EditableProps, getPluginByType, getSlateClass } from '../../lib';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { isHtmlVoidElementTag, PlateElement } from '../components';
import { useNodePath } from '../hooks';
import { useReadOnly } from '../slate-react';
import { ElementProvider } from '../stores';
import { getRenderNodeProps } from './getRenderNodeProps';
import { BelowRootNodes, pluginRenderElement } from './pluginRenderElement';

function FastElementWithPath({
  attributes,
  children,
  editor,
  element,
  plugin,
}: {
  attributes: any;
  children: React.ReactNode;
  editor: PlateEditor;
  element: any;
  plugin: any;
}) {
  const path = useNodePath(element)!;

  return (
    <PlateElement
      {...({
        as: plugin.render?.as,
        attributes,
        children,
        editor,
        element,
        path,
        plugin,
      } as any)}
    />
  );
}

/** @see {@link RenderElement} */
export const pipeRenderElement = (
  editor: PlateEditor,
  renderElementProp?: EditableProps['renderElement']
): EditableProps['renderElement'] => {
  const hasNodeWrappers =
    editor.meta.pluginCache.render.aboveNodes.length > 0 ||
    editor.meta.pluginCache.render.belowNodes.length > 0;
  const hasBelowRootNodes =
    editor.meta.pluginCache.render.belowRootNodes.length > 0;
  const hasInjectNodeProps =
    editor.meta.pluginCache.inject.nodeProps.length > 0;

  return function render(props) {
    const plugin = getPluginByType(editor, props.element.type);

    // We could deprecate isElement (unneeded check)
    if (plugin?.node.isElement) {
      if (
        !hasNodeWrappers &&
        !hasBelowRootNodes &&
        !hasInjectNodeProps &&
        !plugin.render.node &&
        !plugin.node.props &&
        !plugin.node.dangerouslyAllowAttributes?.length
      ) {
        const readOnly = editor.dom.readOnly;

        if (isEditOnly(readOnly, plugin as any, 'render')) return null;

        const blockId =
          typeof props.element.id === 'string' &&
          editor.api.isBlock(props.element)
            ? props.element.id
            : undefined;
        const inset = plugin.rules.selection?.affinity === 'directional';
        const attributes = {
          ...(props.attributes as any),
          className:
            [
              getSlateClass(plugin.node.type),
              (props.attributes as any)?.className,
            ]
              .filter(Boolean)
              .join(' ') || undefined,
        } as any;
        const Tag = (plugin.render?.as ?? 'div') as keyof HTMLElementTagNameMap;
        const isVoidTag = isHtmlVoidElementTag(Tag);

        if (!inset) {
          if (blockId) {
            return isVoidTag ? (
              <Tag
                data-slate-inline={attributes['data-slate-inline']}
                data-slate-node="element"
                data-block-id={blockId}
                {...attributes}
                style={
                  {
                    position: 'relative',
                    ...attributes.style,
                  } as React.CSSProperties
                }
              />
            ) : (
              <Tag
                data-slate-inline={attributes['data-slate-inline']}
                data-slate-node="element"
                data-block-id={blockId}
                {...attributes}
                style={
                  {
                    position: 'relative',
                    ...attributes.style,
                  } as React.CSSProperties
                }
              >
                {props.children}
              </Tag>
            );
          }

          return isVoidTag ? (
            <Tag
              data-slate-inline={attributes['data-slate-inline']}
              data-slate-node="element"
              {...attributes}
              style={
                {
                  position: 'relative',
                  ...attributes.style,
                } as React.CSSProperties
              }
            />
          ) : (
            <Tag
              data-slate-inline={attributes['data-slate-inline']}
              data-slate-node="element"
              {...attributes}
              style={
                {
                  position: 'relative',
                  ...attributes.style,
                } as React.CSSProperties
              }
            >
              {props.children}
            </Tag>
          );
        }

        return (
          <FastElementWithPath
            attributes={attributes}
            editor={editor}
            element={props.element}
            plugin={plugin}
          >
            {props.children}
          </FastElementWithPath>
        );
      }

      const path = useNodePath(props.element)!;

      return pluginRenderElement(
        editor,
        plugin as any
      )({
        ...props,
        path,
      } as any) as any;
    }

    if (renderElementProp) {
      return renderElementProp(props as any);
    }

    const readOnly = useReadOnly();
    const path = useNodePath(props.element)!;
    const ctxProps = getRenderNodeProps({
      // `transformProps` can run hooks, so we need to disable it for default elements.
      disableInjectNodeProps: true,
      editor,
      props: { ...props, path } as any,
      readOnly,
    }) as any;

    return (
      <ElementProvider
        element={ctxProps.element}
        entry={[ctxProps.element, path]}
        path={path}
        scope={ctxProps.element.type ?? 'default'}
      >
        <PlateElement {...ctxProps}>
          {props.children}

          <BelowRootNodes {...ctxProps} />
        </PlateElement>
      </ElementProvider>
    );
  };
};
