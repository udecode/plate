import type { Element, Path, Text } from '@platejs/plite';

import { isDefined } from '@udecode/utils';

import type { BaseEditor } from '../../lib/editor';
import type { BasePlugin, TransformOptions } from '../../lib/plugin/BasePlugin';

import {
  type GetInjectNodePropsOptions,
  type GetInjectNodePropsReturnType,
  getEditorPlugin,
} from '../../lib/plugin';
import { getInjectMatch } from '../../lib/utils/getInjectMatch';

const getNodeProp = (node: Element | Text, key?: string) =>
  key ? (node as Record<string, unknown>)[key] : undefined;

const getNodePropClassValue = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : undefined;

/**
 * Return if `element`, `text`, `nodeKey` is defined. Return if `node.type` is
 * not in `targetPlugins` (if defined). Return if `value = node[nodeKey]` is not
 * in `validNodeValues` (if defined). If `classNames[value]` is defined,
 * override `className` with it. If `styleKey` is defined, override `style` with
 * `[styleKey]: value`.
 */
export const pluginInjectNodeProps = (
  editor: BaseEditor,
  plugin: BasePlugin,
  nodeProps: GetInjectNodePropsOptions,
  getElementPath: (node: Element | Text) => Path
): GetInjectNodePropsReturnType | undefined => {
  const {
    key,
    inject: { excludeBelowPlugins, maxLevel, nodeProps: injectNodeProps },
  } = plugin;

  const { element, text } = nodeProps;

  const node = element ?? text;

  if (!node) return;
  if (!injectNodeProps) return;

  const {
    classNames,
    defaultNodeValue,
    nodeKey = editor.getType(key),
    query,
    styleKey = nodeKey,
    transformClassName,
    transformNodeValue,
    transformProps,
    transformStyle,
    validNodeValues,
  } = injectNodeProps;

  const injectMatch = getInjectMatch(editor, plugin);
  const shouldResolvePathForMatch = !!(excludeBelowPlugins || maxLevel);
  const nodeValue = getNodeProp(node, nodeKey);
  const editorPluginContext = getEditorPlugin(editor, plugin);
  const getTransformOptions = (value?: unknown): TransformOptions => ({
    ...nodeProps,
    ...editorPluginContext,
    nodeValue,
    value,
  });
  const callTransformPropsWithoutInjecting = () => {
    // `transformProps` may call React hooks. Keep the call order stable even
    // when this node does not receive injected props.
    transformProps?.({ ...getTransformOptions(), props: {} });
  };

  if (
    !injectMatch(
      node,
      shouldResolvePathForMatch ? getElementPath(node) : undefined
    )
  ) {
    callTransformPropsWithoutInjecting();

    return;
  }

  const queryResult = query?.({
    ...injectNodeProps,
    ...editorPluginContext,
    nodeProps,
  });

  if (query && !queryResult) {
    callTransformPropsWithoutInjecting();

    return;
  }

  // early return if there is no reason to inject props
  if (
    !transformProps &&
    (!isDefined(nodeValue) ||
      (validNodeValues && !validNodeValues.includes(nodeValue)) ||
      nodeValue === defaultNodeValue)
  ) {
    return;
  }

  const value = transformNodeValue?.(getTransformOptions()) ?? nodeValue;
  const transformOptions = getTransformOptions(value);

  let newProps: GetInjectNodePropsReturnType = {};
  const nodeValueKey = getNodePropClassValue(nodeValue);
  const valueKey = getNodePropClassValue(value);

  if (element && nodeKey && nodeValueKey) {
    newProps.className = `plite-${nodeKey}-${nodeValueKey}`;
  }
  if ((nodeValueKey && classNames?.[nodeValueKey]) || transformClassName) {
    newProps.className =
      transformClassName?.(transformOptions) ??
      (valueKey ? classNames?.[valueKey] : undefined);
  }
  if (styleKey) {
    newProps.style = transformStyle?.(transformOptions) ?? {
      [styleKey as string]: value,
    };
  }
  if (transformProps) {
    newProps =
      transformProps({ ...transformOptions, props: newProps }) ?? newProps;
  }

  return newProps;
};
