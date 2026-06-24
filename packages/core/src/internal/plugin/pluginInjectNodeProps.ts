import type { Element, Path, Text } from '@platejs/plite';

import { isDefined } from '@udecode/utils';

import type { BasePlateEditor } from '../../lib/editor';
import type {
  EditorPlugin,
  TransformOptions,
} from '../../lib/plugin/EditorPlugin';

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
  editor: BasePlateEditor,
  plugin: EditorPlugin,
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
    styleKey = nodeKey as any,
    transformClassName,
    transformNodeValue,
    transformProps,
    transformStyle,
    validNodeValues,
  } = injectNodeProps;

  const injectMatch = getInjectMatch(editor, plugin);
  const shouldResolvePathForMatch = !!(excludeBelowPlugins || maxLevel);
  const nodeValue = node[nodeKey!] as any;
  const editorPluginContext = getEditorPlugin(editor, plugin) as any;
  const transformOptions: TransformOptions = {
    ...nodeProps,
    ...editorPluginContext,
    nodeValue,
  };
  const callTransformPropsForHookStability = () => {
    transformProps?.({ ...transformOptions, props: {} });
  };

  if (
    !injectMatch(
      node,
      shouldResolvePathForMatch ? getElementPath(node) : undefined
    )
  ) {
    callTransformPropsForHookStability();

    return;
  }

  const queryResult = query?.({
    ...injectNodeProps,
    ...editorPluginContext,
    nodeProps,
  });

  if (query && !queryResult) {
    callTransformPropsForHookStability();

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

  const value = transformNodeValue?.(transformOptions) ?? nodeValue;
  transformOptions.value = value;

  let newProps: GetInjectNodePropsReturnType = {};

  if (element && nodeKey && nodeValue) {
    newProps.className = `plite-${nodeKey}-${nodeValue}`;
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
