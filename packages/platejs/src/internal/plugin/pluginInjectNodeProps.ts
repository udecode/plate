import type { Element, Path, Text } from 'plitejs';

import type { Editor } from '../../lib/editor';
import type {
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
} from '../../lib/plugin';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import { getInjectMatch } from '../../lib/utils/getInjectMatch';
import { isDefined } from '../../lib/utils/isDefined';
import { getCompiledPlateModelBinding } from './compilePlateModel';

const getNodeProp = (node: Element | Text, key?: string) =>
  key ? node[key] : undefined;

const getNodePropClassValue = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : undefined;

/**
 * Return if `element`, `text`, `nodeKey` is defined. Return if `node.type` is
 * not in `targetPlugins` (when configured). Return if `value =
 * node[nodeKey]` is not in `validNodeValues` (if defined). If
 * `classNames[value]` is defined,
 * override `className` with it. If `styleKey` is defined, override `style` with
 * `[styleKey]: value`.
 */
export const pluginInjectNodeProps = (
  editor: Editor,
  plugin: Pick<AnyBasePlugin, 'inject' | 'name' | 'targetPlugins'>,
  nodeProps: GetInjectNodePropsOptions,
  getElementPath: (node: Element | Text) => Path | undefined
): GetInjectNodePropsReturnType | undefined => {
  const {
    name,
    inject: { excludeBelowPlugins, maxLevel, nodeProps: injectNodeProps },
  } = plugin;

  const { element, text } = nodeProps;

  const node = element ?? text;

  if (!node) return undefined;
  if (!injectNodeProps) return undefined;

  const {
    classNames,
    defaultNodeValue,
    nodeKey: configuredNodeKey,
    query,
    styleKey: configuredStyleKey,
    transformClassName,
    transformNodeValue,
    transformProps,
    transformStyle,
    validNodeValues,
  } = injectNodeProps;
  const nodeKey =
    configuredNodeKey ??
    getCompiledPlateModelBinding(editor, name)?.propertyKey ??
    undefined;
  const styleKey = configuredStyleKey ?? nodeKey;

  const injectMatch = getInjectMatch(editor, plugin);
  const shouldResolvePathForMatch = !!(excludeBelowPlugins || maxLevel);
  const nodeValue = getNodeProp(node, nodeKey);
  const editorPluginContext = createPluginContext(editor, plugin.name);
  const getTransformOptions = (value?: unknown) => ({
    ...nodeProps,
    ...editorPluginContext,
    nodeValue,
    value,
  });
  const callTransformPropsWithoutInjecting = () => {
    // `transformProps` may call React hooks. Keep the call order stable even
    // when this node does not receive injected props.
    if (typeof transformProps === 'function') {
      Reflect.apply(transformProps, undefined, [
        { ...getTransformOptions(), props: {} },
      ]);
    }
  };

  const path = shouldResolvePathForMatch ? getElementPath(node) : undefined;

  if (shouldResolvePathForMatch && !path) {
    callTransformPropsWithoutInjecting();

    return undefined;
  }

  if (!injectMatch(node, path)) {
    callTransformPropsWithoutInjecting();

    return undefined;
  }

  const queryResult =
    typeof query === 'function'
      ? Reflect.apply(query, undefined, [
          {
            classNames,
            defaultNodeValue,
            ...editorPluginContext,
            nodeKey,
            nodeProps,
            styleKey,
            validNodeValues,
          },
        ])
      : undefined;

  if (typeof query === 'function' && !queryResult) {
    callTransformPropsWithoutInjecting();

    return undefined;
  }

  // early return if there is no reason to inject props
  if (
    typeof transformProps !== 'function' &&
    (!isDefined(nodeValue) ||
      (validNodeValues && !validNodeValues.includes(nodeValue)) ||
      nodeValue === defaultNodeValue)
  ) {
    return undefined;
  }

  const value =
    typeof transformNodeValue === 'function'
      ? (Reflect.apply(transformNodeValue, undefined, [
          getTransformOptions(),
        ]) ?? nodeValue)
      : nodeValue;
  const transformOptions = getTransformOptions(value);

  let newProps: GetInjectNodePropsReturnType = {};
  const nodeValueKey = getNodePropClassValue(nodeValue);
  const valueKey = getNodePropClassValue(value);

  if (element && nodeKey && nodeValueKey) {
    newProps.className = `plite-${nodeKey}-${nodeValueKey}`;
  }
  if (
    (nodeValueKey && classNames?.[nodeValueKey]) ||
    typeof transformClassName === 'function'
  ) {
    newProps.className =
      typeof transformClassName === 'function'
        ? Reflect.apply(transformClassName, undefined, [transformOptions])
        : valueKey
          ? classNames?.[valueKey]
          : undefined;
  }
  if (styleKey) {
    newProps.style =
      typeof transformStyle === 'function'
        ? Reflect.apply(transformStyle, undefined, [transformOptions])
        : { [styleKey]: value };
  }
  if (typeof transformProps === 'function') {
    newProps =
      Reflect.apply(transformProps, undefined, [
        { ...transformOptions, props: newProps },
      ]) ?? newProps;
  }

  return newProps;
};
