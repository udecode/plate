import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';

import {
  findEditorPath,
  isEditorBlock,
} from '../../internal/utils/runtimeEditorQueries';
import { type EditableProps, getPluginByType, getSlateClass } from '../../lib';
import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import {
  isHtmlVoidElementTag,
  PlateElement,
  useBlockIdAttributeRef,
} from '../components';
import { useNodePath } from '../hooks';
import { useReadOnly } from '../slate-react';
import { ElementProvider } from '../stores';
import { getRenderNodeProps } from './getRenderNodeProps';
import { BelowRootNodes, pluginRenderElement } from './pluginRenderElement';

type RenderElementProps = Parameters<
  NonNullable<EditableProps['renderElement']>
>[0];

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
    <ElementProvider
      element={element}
      entry={[element, path]}
      path={path}
      scope={plugin.key}
    >
      <FastElementBody
        attributes={attributes}
        editor={editor}
        element={element}
        path={path}
        plugin={plugin}
      >
        {children}
      </FastElementBody>
    </ElementProvider>
  );
}

function useFastInjectedAttributes({
  attributes,
  editor,
  element,
  path,
  readOnly,
}: {
  attributes: any;
  editor: PlateEditor;
  element: any;
  path: any;
  readOnly: boolean;
}) {
  if (editor.meta.pluginCache.inject.nodeProps.length === 0) return attributes;

  return (
    pipeInjectNodeProps(
      editor,
      {
        attributes,
        element,
        path,
      },
      (node) => (node === element ? path : findEditorPath(editor, node)!),
      readOnly
    ) as any
  ).attributes;
}

function FastElementBody({
  attributes,
  children,
  editor,
  element,
  path,
  plugin,
}: {
  attributes: any;
  children: React.ReactNode;
  editor: PlateEditor;
  element: any;
  path: any;
  plugin: any;
}) {
  const readOnly = useReadOnly();
  const injectedAttributes = useFastInjectedAttributes({
    attributes,
    editor,
    element,
    path,
    readOnly,
  });

  return (
    <PlateElement
      {...({
        as: plugin.render?.as,
        attributes: injectedAttributes,
        children,
        editor,
        element,
        path,
        plugin,
      } as any)}
    />
  );
}

function FastIntrinsicElement({
  attributes,
  blockId,
  children,
  editor,
  element,
  isVoidTag,
  plugin,
  renderBelowNodes,
  tag: Tag,
}: {
  attributes: any;
  blockId: any;
  children: React.ReactNode;
  editor: PlateEditor;
  element: any;
  isVoidTag: boolean;
  plugin: any;
  renderBelowNodes: boolean;
  tag: keyof HTMLElementTagNameMap;
}) {
  const path = useNodePath(element)!;

  return (
    <ElementProvider
      element={element}
      entry={[element, path]}
      path={path}
      scope={plugin.key}
    >
      <FastIntrinsicElementBody
        attributes={attributes}
        blockId={blockId}
        editor={editor}
        element={element}
        isVoidTag={isVoidTag}
        path={path}
        plugin={plugin}
        renderBelowNodes={renderBelowNodes}
        tag={Tag}
      >
        {children}
      </FastIntrinsicElementBody>
    </ElementProvider>
  );
}

function FastIntrinsicElementBody({
  attributes,
  blockId,
  children,
  editor,
  element,
  isVoidTag,
  path,
  plugin,
  renderBelowNodes,
  tag: Tag,
}: {
  attributes: any;
  blockId: any;
  children: React.ReactNode;
  editor: PlateEditor;
  element: any;
  isVoidTag: boolean;
  path: any;
  plugin: any;
  renderBelowNodes: boolean;
  tag: keyof HTMLElementTagNameMap;
}) {
  const readOnly = useReadOnly();
  const injectedAttributes = useFastInjectedAttributes({
    attributes,
    editor,
    element,
    path,
    readOnly,
  });
  const ref = useBlockIdAttributeRef<HTMLElement>(
    blockId,
    injectedAttributes.ref
  );
  let elementChildren = children;

  if (renderBelowNodes) {
    const nodeProps = {
      attributes,
      children,
      editor,
      element,
      path,
      plugin,
    } as any;

    editor.meta.pluginCache.render.belowNodes.forEach((key) => {
      const wrapperPlugin = editor.getPlugin({ key });

      if (isEditOnly(readOnly, wrapperPlugin as any, 'render')) return;

      const hoc = wrapperPlugin.render.belowNodes!({ ...nodeProps, key });

      if (hoc) {
        elementChildren = hoc({
          ...nodeProps,
          children: elementChildren,
        });
      }
    });
  }

  const fastElementProps = {
    'data-plite-inline': injectedAttributes['data-plite-inline'],
    'data-plite-node': 'element',
    ...injectedAttributes,
    ref,
    style: {
      position: 'relative',
      ...injectedAttributes.style,
    } as React.CSSProperties,
  } as any;

  return isVoidTag ? (
    <div {...fastElementProps}>
      <Tag contentEditable={false} />
      {elementChildren}
    </div>
  ) : (
    <Tag {...fastElementProps}>{elementChildren}</Tag>
  );
}

function PluginElementWithPath({
  editor,
  plugin,
  props,
}: {
  editor: PlateEditor;
  plugin: any;
  props: RenderElementProps;
}) {
  const path = useNodePath(props.element)!;

  return pluginRenderElement(
    editor,
    plugin as any
  )({
    ...props,
    path,
  } as any) as any;
}

function RenderElementPropWithPath({
  props,
  renderElementProp,
}: {
  props: RenderElementProps;
  renderElementProp: NonNullable<EditableProps['renderElement']>;
}) {
  const path = useNodePath(props.element)!;

  return renderElementProp({ ...props, path } as any) as any;
}

function DefaultElementWithPath({
  editor,
  props,
}: {
  editor: PlateEditor;
  props: RenderElementProps;
}) {
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
}

/** @see {@link RenderElement} */
export const pipeRenderElement = (
  editor: PlateEditor,
  renderElementProp?: EditableProps['renderElement']
): EditableProps['renderElement'] => {
  const hasAboveNodes = editor.meta.pluginCache.render.aboveNodes.length > 0;
  const hasBelowRootNodes =
    editor.meta.pluginCache.render.belowRootNodes.length > 0;

  return function render(props): any {
    const plugin = getPluginByType(editor, props.element.type);

    // We could deprecate isElement (unneeded check)
    if (plugin?.node.isElement) {
      if (
        !hasAboveNodes &&
        !hasBelowRootNodes &&
        !plugin.render.node &&
        !plugin.node.props &&
        !plugin.node.dangerouslyAllowAttributes?.length
      ) {
        const readOnly = editor.dom.readOnly;

        if (isEditOnly(readOnly, plugin as any, 'render')) return null;

        const blockId =
          props.element.id && isEditorBlock(editor, props.element)
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
        const renderAs = plugin.render?.as ?? 'div';
        const isIntrinsicTag = typeof renderAs === 'string';
        const Tag = renderAs as keyof HTMLElementTagNameMap;
        const isVoidTag = isIntrinsicTag && isHtmlVoidElementTag(Tag);
        const hasBelowNodeWrappers =
          editor.meta.pluginCache.render.belowNodes.some((key) => {
            const wrapperPlugin = editor.getPlugin({ key });

            return !isEditOnly(readOnly, wrapperPlugin as any, 'render');
          });
        if (!inset && !hasBelowNodeWrappers && isIntrinsicTag) {
          return (
            <FastIntrinsicElement
              attributes={attributes}
              blockId={blockId}
              editor={editor}
              element={props.element}
              isVoidTag={isVoidTag}
              plugin={plugin}
              renderBelowNodes={false}
              tag={Tag}
            >
              {props.children}
            </FastIntrinsicElement>
          );
        }

        if (!inset && hasBelowNodeWrappers && isIntrinsicTag) {
          return (
            <FastIntrinsicElement
              attributes={attributes}
              blockId={blockId}
              editor={editor}
              element={props.element}
              isVoidTag={isVoidTag}
              plugin={plugin}
              renderBelowNodes
              tag={Tag}
            >
              {props.children}
            </FastIntrinsicElement>
          );
        }

        if (!hasBelowNodeWrappers && isIntrinsicTag) {
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

        return (
          <PluginElementWithPath
            editor={editor}
            plugin={plugin}
            props={props}
          />
        );
      }

      return (
        <PluginElementWithPath editor={editor} plugin={plugin} props={props} />
      );
    }

    if (renderElementProp) {
      return (
        <RenderElementPropWithPath
          props={props}
          renderElementProp={renderElementProp}
        />
      );
    }

    return <DefaultElementWithPath editor={editor} props={props} />;
  };
};
