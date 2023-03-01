import { CSSProperties } from 'react';
import clsx from 'clsx';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { isElement } from '../../../../slate-utils/src/slate/element/isElement';
import { EElement } from '../../../../slate-utils/src/slate/element/TElement';
import { EText } from '../../../../slate-utils/src/slate/text/TText';
import { AnyObject } from '../../../../slate-utils/src/types/misc/AnyObject';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { WithPlatePlugin } from '../../types/plugin/PlatePlugin';

export interface GetInjectPropsOptions<V extends Value = Value> {
  /**
   * Existing className.
   */
  className?: string;

  /**
   * Style value or className key.
   */
  element?: EElement<V>;

  /**
   * Style value or className key.
   */
  text?: EText<V>;

  /**
   * Existing style.
   */
  style?: CSSProperties;
}

export interface GetInjectPropsReturnType extends AnyObject {
  className?: string;
  style?: CSSProperties;
}

/**
 * Return if `element`, `text`, `nodeKey` is defined.
 * Return if `node.type` is not in `validTypes` (if defined).
 * Return if `value = node[nodeKey]` is not in `validNodeValues` (if defined).
 * If `classNames[value]` is defined, override `className` with it.
 * If `styleKey` is defined, override `style` with `[styleKey]: value`.
 */
export const pluginInjectProps = <V extends Value>(
  editor: PlateEditor<V>,
  { key, inject: { props } }: WithPlatePlugin<{}, V>,
  nodeProps: GetInjectPropsOptions<V>
): GetInjectPropsReturnType | undefined => {
  const { element, text, className, style } = nodeProps;

  const node = element ?? text;
  if (!node) return;

  if (!props) return;
  const {
    nodeKey = key,
    styleKey = nodeKey as any,
    validTypes,
    classNames,
    transformClassName,
    transformNodeValue,
    transformStyle,
    validNodeValues,
    defaultNodeValue,
  } = props;

  if (
    validTypes &&
    isElement(node) &&
    node.type &&
    !validTypes.includes(node.type)
  ) {
    return;
  }

  const nodeValue = node[nodeKey!] as any;

  // early return if there is now reason to add styles
  if (
    !nodeValue ||
    (validNodeValues && !validNodeValues.includes(nodeValue)) ||
    nodeValue === defaultNodeValue
  ) {
    return;
  }

  const res: GetInjectPropsReturnType = {};

  const transformOptions = { ...nodeProps, nodeValue };

  const value = transformNodeValue?.(transformOptions) ?? nodeValue;

  if (element) {
    res.className = clsx(className, `slate-${nodeKey}-${nodeValue}`);
  }

  if (classNames?.[nodeValue] || transformClassName) {
    res.className =
      transformClassName?.(transformOptions) ??
      clsx(className, classNames?.[value]);
  }

  if (styleKey) {
    res.style = transformStyle?.(transformOptions) ?? {
      ...style,
      [styleKey as string]: value,
    };
  }

  return res;
};
