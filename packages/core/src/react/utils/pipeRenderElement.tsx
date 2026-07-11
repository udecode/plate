import React from 'react';

import type { Element, Path } from '@platejs/plite';
import { useEditorReadOnly } from '@platejs/plite-react';

import type { PlateEditor } from '../editor/PlateEditor';

import {
  type AnyBasePlugin,
  type EditableProps,
  getEditorPlugin as getBaseEditorPlugin,
  getPluginByType,
  getPluginNodeClass,
} from '../../lib';
import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import {
  isHtmlVoidElementTag,
  PlateElement,
  useBlockIdAttributeRef,
} from '../components';
import { useNodePath } from '../hooks';
import { ElementProvider } from '../stores';
import { getEditorPlugin } from '../plugin';
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
  attributes: RenderElementProps['attributes'];
  children: React.ReactNode;
  editor: PlateEditor;
  element: Element;
  plugin: AnyBasePlugin;
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
  attributes: RenderElementProps['attributes'];
  editor: PlateEditor;
  element: Element;
  path: Path;
  readOnly: boolean;
}) {
  if (editor.runtime.pluginCache.inject.nodeProps.length === 0)
    return attributes;

  return pipeInjectNodeProps(
    editor,
    {
      attributes,
      element,
      path,
    },
    (node) => (node === element ? path : editor.read.nodes.path(node)),
    readOnly
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
  attributes: RenderElementProps['attributes'];
  children: React.ReactNode;
  editor: PlateEditor;
  element: Element;
  path: Path;
  plugin: AnyBasePlugin;
}) {
  const readOnly = useEditorReadOnly();
  const pluginContext = getEditorPlugin(editor, { key: plugin.key });
  const injectedAttributes = useFastInjectedAttributes({
    attributes,
    editor,
    element,
    path,
    readOnly,
  });

  return (
    <PlateElement
      {...pluginContext}
      as={plugin.render?.as ?? undefined}
      attributes={injectedAttributes}
      element={element}
      path={path}
    >
      {children}
    </PlateElement>
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
  tag,
}: {
  attributes: RenderElementProps['attributes'];
  blockId: unknown;
  children: React.ReactNode;
  editor: PlateEditor;
  element: Element;
  isVoidTag: boolean;
  plugin: AnyBasePlugin;
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
        tag={tag}
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
  attributes: RenderElementProps['attributes'];
  blockId: unknown;
  children: React.ReactNode;
  editor: PlateEditor;
  element: Element;
  isVoidTag: boolean;
  path: Path;
  plugin: AnyBasePlugin;
  renderBelowNodes: boolean;
  tag: keyof HTMLElementTagNameMap;
}) {
  const readOnly = useEditorReadOnly();
  const pluginContext = getBaseEditorPlugin(editor, plugin);
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
      ...pluginContext,
      attributes: injectedAttributes,
      children,
      element,
      path,
    };

    editor.runtime.pluginCache.render.belowNodes.forEach((key) => {
      const wrapperPlugin = editor.getPlugin({ key });
      const hoc = wrapperPlugin.render.belowNodes!({ ...nodeProps, key });

      if (hoc && !isEditOnly(readOnly, wrapperPlugin, 'render')) {
        elementChildren = hoc({
          ...nodeProps,
          children: elementChildren,
        });
      }
    });
  }

  const fastElementProps: React.HTMLAttributes<HTMLElement> &
    React.RefAttributes<HTMLElement> & { 'data-plite-node': 'element' } = {
    ...injectedAttributes,
    'data-plite-node': 'element',
    ref,
    style: {
      position: 'relative',
      ...injectedAttributes.style,
    },
  };

  if (isVoidTag) {
    return React.createElement(
      'div',
      fastElementProps,
      React.createElement(Tag, { contentEditable: false }),
      elementChildren
    );
  }

  return React.createElement(Tag, fastElementProps, elementChildren);
}

function PluginElementWithPath({
  editor,
  plugin,
  props,
}: {
  editor: PlateEditor;
  plugin: AnyBasePlugin;
  props: RenderElementProps;
}) {
  const path = useNodePath(props.element)!;

  const pluginContext = getEditorPlugin(editor, { key: plugin.key });

  return pluginRenderElement(
    editor,
    pluginContext.plugin
  )({
    ...pluginContext,
    ...props,
    path,
  });
}

function RenderElementPropWithPath({
  props,
  renderElementProp,
}: {
  props: RenderElementProps;
  renderElementProp: NonNullable<EditableProps['renderElement']>;
}) {
  const path = useNodePath(props.element)!;

  return renderElementProp({ ...props, path });
}

function DefaultElementWithPath({
  editor,
  props,
}: {
  editor: PlateEditor;
  props: RenderElementProps;
}) {
  const readOnly = useEditorReadOnly();
  const path = useNodePath(props.element)!;
  const ctxProps = getRenderNodeProps({
    // `transformProps` can run hooks, so we need to disable it for default elements.
    disableInjectNodeProps: true,
    editor,
    props: { ...props, path },
    readOnly,
  });
  const defaultPluginContext = getEditorPlugin(editor, {
    key: props.element.type ?? 'default',
  });

  return (
    <ElementProvider
      element={ctxProps.element}
      entry={[ctxProps.element, path]}
      path={path}
      scope={ctxProps.element.type ?? 'default'}
    >
      <PlateElement {...defaultPluginContext} {...ctxProps}>
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
  const hasAboveNodes = editor.runtime.pluginCache.render.aboveNodes.length > 0;
  const hasBelowRootNodes =
    editor.runtime.pluginCache.render.belowRootNodes.length > 0;

  return function render(props) {
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
        const readOnly = editor.read.view.isReadOnly();

        if (isEditOnly(readOnly, plugin, 'render')) return null;

        const blockId =
          props.element.id && editor.read.schema.isBlock(props.element)
            ? props.element.id
            : undefined;
        const inset = plugin.rules.selection?.affinity === 'directional';
        const attributes = {
          ...props.attributes,
          className:
            [getPluginNodeClass(plugin.node.type), props.attributes.className]
              .filter(Boolean)
              .join(' ') || undefined,
        };
        const renderAs = plugin.render?.as ?? 'div';
        const isIntrinsicTag = typeof renderAs === 'string';
        const Tag = typeof renderAs === 'string' ? renderAs : 'div';
        const isVoidTag = isIntrinsicTag && isHtmlVoidElementTag(Tag);
        const hasBelowNodeWrappers =
          editor.runtime.pluginCache.render.belowNodes.length > 0;
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
