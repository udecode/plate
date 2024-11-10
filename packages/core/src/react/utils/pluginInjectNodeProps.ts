import { findNodePath } from '@udecode/slate-react';
import { isDefined } from '@udecode/utils';

import type { SlateEditor } from '../../lib/editor';
import type {
  EditorPlugin,
  TransformOptions,
} from '../../lib/plugin/SlatePlugin';

import {
  type GetInjectNodePropsOptions,
  type GetInjectNodePropsReturnType,
  getEditorPlugin,
} from '../../lib/plugin';
import { getInjectMatch } from '../../lib/utils/getInjectMatch';

/**
 * Return if `element`, `text`, `nodeKey` is defined. Return if `node.type` is
 * not in `targetPlugins` (if defined). Return if `value = node[nodeKey]` is not
 * in `validNodeValues` (if defined). If `classNames[value]` is defined,
 * override `className` with it. If `styleKey` is defined, override `style` with
 * `[styleKey]: value`.
 */
export const pluginInjectNodeProps = (
  editor: SlateEditor,
  plugin: EditorPlugin,
  nodeProps: GetInjectNodePropsOptions
): GetInjectNodePropsReturnType | undefined => {
  const {
    key,
    inject: { nodeProps: injectNodeProps },
  } = plugin;

  const { element, text } = nodeProps;

  const node = element ?? text;

  if (!node) return;
  if (!injectNodeProps) return;

  const {
    classNames,
    defaultNodeValue,
    nodeKey = key,
    query,
    styleKey = nodeKey as any,
    transformClassName,
    transformNodeValue,
    transformProps,
    transformStyle,
    validNodeValues,
  } = injectNodeProps;

  const injectMatch = getInjectMatch(editor, plugin);

  if (!injectMatch(node, findNodePath(editor, node)!)) return;

  const queryResult = query?.({
    ...injectNodeProps,
    ...(getEditorPlugin(editor, plugin) as any),
    nodeProps,
  });

  if (query && !queryResult) {
    return;
  }

  const nodeValue = node[nodeKey!] as any;

  // early return if there is no reason to inject props
  if (
    !transformProps &&
    (!isDefined(nodeValue) ||
      (validNodeValues && !validNodeValues.includes(nodeValue)) ||
      nodeValue === defaultNodeValue)
  ) {
    return;
  }

  const transformOptions: TransformOptions = {
    ...nodeProps,
    ...(getEditorPlugin(editor, plugin) as any),
    nodeValue,
  };
  const value = transformNodeValue?.(transformOptions) ?? nodeValue;
  transformOptions.value = value;

  let newProps: GetInjectNodePropsReturnType = {};

  if (element && nodeKey) {
    newProps.className = `slate-${nodeKey}-${nodeValue}`;
  }
  if (classNames?.[nodeValue] || transformClassName) {
    newProps.className =
      transformClassName?.(transformOptions) ?? classNames?.[value];
  }
  if (styleKey) {
    newProps.style =
      transformStyle?.(transformOptions) ??
      ({
        [styleKey as string]: value,
      } as any);
  }
  if (transformProps) {
    newProps =
      transformProps({ ...transformOptions, props: newProps }) ?? newProps;
  }

  return newProps;
};
