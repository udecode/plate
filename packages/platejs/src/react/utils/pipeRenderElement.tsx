import React from 'react';

import type { Element, Path } from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePluginByType,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { pipeInjectNodeProps } from '../../internal/plugin/pipeInjectNodeProps';
import { type EditableProps, getPluginNodeClass } from '../../lib';
import { isHtmlVoidElementTag, PlateElement } from '../components';
import type { Editor } from '../editor/Editor';
import { useEditorReadOnly } from '../plite-react';
import { createPluginContext } from '../plugin/createPluginContext.internal';
import type { AnyResolvedPlatePlugin } from '../plugin/PlatePlugin';
import { ElementProvider } from '../stores';
import { getRenderNodeProps } from './getRenderNodeProps';
import { BelowRootNodes, pluginRenderElement } from './pluginRenderElement';

type RenderElementProps = Parameters<
  NonNullable<EditableProps['renderElement']>
>[0];

const getRenderedElementPath = (
  editor: Editor,
  element: Element,
  attributes: RenderElementProps['attributes']
) => {
  const pathAttribute = attributes['data-plite-path'];

  if (typeof pathAttribute === 'string') {
    const path = pathAttribute.split(',').map(Number);

    if (
      pathAttribute.length > 0 &&
      path.length > 0 &&
      path.every(Number.isSafeInteger)
    ) {
      return path;
    }

    throw new Error('Rendered element has an invalid data-plite-path.');
  }

  const path = editor.read.nodes.path(element);

  if (!path) {
    throw new Error('Rendered element is not present in the editor snapshot.');
  }

  return path;
};

function FastElementWithPath({
  attributes,
  children,
  editor,
  element,
  plugin,
  slots,
}: {
  attributes: RenderElementProps['attributes'];
  children: React.ReactNode;
  editor: Editor;
  element: Element;
  plugin: AnyResolvedPlatePlugin;
  slots: RenderElementProps['slots'];
}) {
  const path = getRenderedElementPath(editor, element, attributes);

  return (
    <ElementProvider
      element={element}
      entry={[element, path]}
      path={path}
      scope={plugin.name}
    >
      <FastElementBody
        attributes={attributes}
        editor={editor}
        element={element}
        path={path}
        plugin={plugin}
        slots={slots}
      >
        {children}
      </FastElementBody>
    </ElementProvider>
  );
}

function getFastInjectedAttributes({
  attributes,
  editor,
  element,
  path,
  readOnly,
}: {
  attributes: RenderElementProps['attributes'];
  editor: Editor;
  element: Element;
  path: Path;
  readOnly: boolean;
}) {
  if (getPlateRuntime(editor).pluginCache.inject.nodeProps.length === 0) {
    return attributes;
  }

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
  slots,
}: {
  attributes: RenderElementProps['attributes'];
  children: React.ReactNode;
  editor: Editor;
  element: Element;
  path: Path;
  plugin: AnyResolvedPlatePlugin;
  slots: RenderElementProps['slots'];
}) {
  const readOnly = useEditorReadOnly();
  const pluginContext = createPluginContext(editor, plugin.name);
  const injectedAttributes = getFastInjectedAttributes({
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
      slots={slots}
    >
      {children}
    </PlateElement>
  );
}

function FastIntrinsicElement({
  attributes,
  children,
  editor,
  element,
  isVoidTag,
  plugin,
  renderBelowNodes,
  slots,
  tag,
}: {
  attributes: RenderElementProps['attributes'];
  children: React.ReactNode;
  editor: Editor;
  element: Element;
  isVoidTag: boolean;
  plugin: AnyResolvedPlatePlugin;
  renderBelowNodes: boolean;
  slots: RenderElementProps['slots'];
  tag: keyof HTMLElementTagNameMap;
}) {
  const path = getRenderedElementPath(editor, element, attributes);

  return (
    <ElementProvider
      element={element}
      entry={[element, path]}
      path={path}
      scope={plugin.name}
    >
      <FastIntrinsicElementBody
        attributes={attributes}
        editor={editor}
        element={element}
        isVoidTag={isVoidTag}
        path={path}
        plugin={plugin}
        renderBelowNodes={renderBelowNodes}
        slots={slots}
        tag={tag}
      >
        {children}
      </FastIntrinsicElementBody>
    </ElementProvider>
  );
}

function FastIntrinsicElementBody({
  attributes,
  children,
  editor,
  element,
  isVoidTag,
  path,
  plugin,
  renderBelowNodes,
  slots,
  tag: Tag,
}: {
  attributes: RenderElementProps['attributes'];
  children: React.ReactNode;
  editor: Editor;
  element: Element;
  isVoidTag: boolean;
  path: Path;
  plugin: AnyResolvedPlatePlugin;
  renderBelowNodes: boolean;
  slots: RenderElementProps['slots'];
  tag: keyof HTMLElementTagNameMap;
}) {
  const readOnly = useEditorReadOnly();
  const elementContext = createPluginContext(editor, plugin.name);
  const injectedAttributes = getFastInjectedAttributes({
    attributes,
    editor,
    element,
    path,
    readOnly,
  });
  let elementChildren = children;

  if (renderBelowNodes) {
    const nodeProps = {
      ...elementContext,
      attributes: injectedAttributes,
      children,
      element,
      slots,
    };

    getPlateRuntime(editor).pluginCache.render.belowNodes.forEach((name) => {
      const wrapperContext = createPluginContext(editor, name);
      const wrap = (
        wrapperContext.plugin.render.belowNodes ??
        failInvariant('Expected value to be defined')
      )({
        ...nodeProps,
        ...wrapperContext,
      });

      if (wrap && !isEditOnly(readOnly, wrapperContext.plugin, 'render')) {
        elementChildren = wrap({
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
  editor: Editor;
  plugin: AnyResolvedPlatePlugin;
  props: RenderElementProps;
}) {
  const path = getRenderedElementPath(editor, props.element, props.attributes);

  const pluginContext = createPluginContext(editor, plugin.name);

  return pluginRenderElement(
    editor,
    pluginContext.plugin
  )({
    ...pluginContext,
    ...props,
    path,
  });
}

function DefaultElementWithPath({
  editor,
  props,
}: {
  editor: Editor;
  props: RenderElementProps;
}) {
  const readOnly = useEditorReadOnly();
  const path = getRenderedElementPath(editor, props.element, props.attributes);
  const ctxProps = getRenderNodeProps({
    // `transformProps` can run hooks, so we need to disable it for default elements.
    disableInjectNodeProps: true,
    editor,
    props: { ...props, path },
    readOnly,
  });
  const DefaultPlateElement = PlateElement as unknown as React.ComponentType<
    Omit<typeof ctxProps, 'path'> & { children: React.ReactNode }
  >;
  const { path: _path, ...nodeProps } = ctxProps;

  return (
    <ElementProvider
      element={ctxProps.element}
      entry={[ctxProps.element, path]}
      path={path}
      scope={ctxProps.element.type ?? 'default'}
    >
      <DefaultPlateElement {...nodeProps}>
        {props.children}

        <BelowRootNodes {...nodeProps} />
      </DefaultPlateElement>
    </ElementProvider>
  );
}

/** @see {@link RenderElement} */
export const pipeRenderElement = (
  editor: Editor,
  renderElementProp?: EditableProps['renderElement']
): EditableProps['renderElement'] => {
  const hasAboveNodes =
    getPlateRuntime(editor).pluginCache.render.aboveNodes.length > 0;
  const hasBelowRootNodes =
    getPlateRuntime(editor).pluginCache.render.belowRootNodes.length > 0;

  return function render(props) {
    if (renderElementProp) {
      const path = getRenderedElementPath(
        editor,
        props.element,
        props.attributes
      );
      const rendered = renderElementProp({ ...props, path });

      if (rendered != null) return rendered;
    }

    const plugin = getCompiledPlatePluginByType(
      editor,
      props.element.type
    ) as unknown as AnyResolvedPlatePlugin | undefined;
    const binding = plugin
      ? getCompiledPlateModelBinding(editor, plugin)
      : undefined;

    if (plugin && binding?.kind === 'element') {
      if (
        !hasAboveNodes &&
        !hasBelowRootNodes &&
        !plugin.render.node &&
        !plugin.render.nodeProps
      ) {
        const readOnly = editor.read.view.isReadOnly();

        if (isEditOnly(readOnly, plugin, 'render')) return null;

        const inset = plugin.rules.selection?.affinity === 'directional';
        const attributes = {
          ...props.attributes,
          className:
            [getPluginNodeClass(plugin.name), props.attributes.className]
              .filter(Boolean)
              .join(' ') || undefined,
        };
        const renderAs = plugin.render?.as ?? 'div';
        const isIntrinsicTag = typeof renderAs === 'string';
        const Tag = typeof renderAs === 'string' ? renderAs : 'div';
        const isVoidTag = isIntrinsicTag && isHtmlVoidElementTag(Tag);
        const hasBelowNodeWrappers =
          getPlateRuntime(editor).pluginCache.render.belowNodes.length > 0;
        if (!inset && !hasBelowNodeWrappers && isIntrinsicTag) {
          return (
            <FastIntrinsicElement
              attributes={attributes}
              editor={editor}
              element={props.element}
              isVoidTag={isVoidTag}
              plugin={plugin}
              renderBelowNodes={false}
              slots={props.slots}
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
              editor={editor}
              element={props.element}
              isVoidTag={isVoidTag}
              plugin={plugin}
              renderBelowNodes
              slots={props.slots}
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
              slots={props.slots}
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

    return <DefaultElementWithPath editor={editor} props={props} />;
  };
};
