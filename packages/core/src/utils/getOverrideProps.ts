import { CSSProperties } from 'react';
import clsx from 'clsx';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { TElement } from '../types/slate/TElement';
import { TText } from '../types/slate/TText';
import { AnyObject } from '../types/utility/AnyObject';

export interface GetOverridePropsOptions {
  /**
   * Existing className.
   */
  className?: string;

  /**
   * Style value or className key.
   */
  element?: TElement;

  /**
   * Style value or className key.
   */
  text?: TText;

  /**
   * Existing style.
   */
  style?: CSSProperties;
}

export interface GetOverridePropsReturnType extends AnyObject {
  className?: string;
  style?: CSSProperties;
}

/**
 * Util for `overrideProps`.
 * Return if `element`, `text`, `nodeKey` is defined.
 * Return if `node.type` is not in `validTypes` (if defined).
 * Return if `value = node[nodeKey]` is not in `validNodeValues` (if defined).
 * If `classNames[value]` is defined, override `className` with it.
 * If `styleKey` is defined, override `style` with `[styleKey]: value`.
 */
export const getOverrideProps = (
  editor: PlateEditor,
  {
    plugin,
    props,
  }: {
    plugin: PlatePlugin;
    props: GetOverridePropsOptions;
  }
): GetOverridePropsReturnType | undefined => {
  const { key, overrideProps } = plugin;
  const { element, text, className, style } = props;

  const node = element ?? text;
  if (!node) return;

  if (!overrideProps) return;
  const {
    nodeKey = key,
    styleKey = nodeKey as any,
    validTypes,
    classNames,
    transformClassName,
    transformNodeValue,
    transformStyle,
    validNodeValues,
  } = overrideProps;

  if (validTypes && node.type && !validTypes.includes(node.type)) {
    return;
  }

  const nodeValue = node[nodeKey];

  // early return if there is now reason to add styles
  if (!nodeValue || (validNodeValues && !validNodeValues.includes(nodeValue))) {
    return;
  }

  const res: GetOverridePropsReturnType = {};

  const transformOptions = { ...props, nodeValue };

  const value = transformNodeValue?.(editor, transformOptions) ?? nodeValue;

  if (element) {
    res.className = clsx(className, `slate-${nodeKey}-${nodeValue}`);
  }

  if (classNames?.[nodeValue] || transformClassName) {
    res.className =
      transformClassName?.(editor, transformOptions) ??
      clsx(className, classNames?.[value]);
  }

  if (styleKey) {
    res.style = transformStyle?.(editor, transformOptions) ?? {
      ...style,
      [styleKey as string]: value,
    };
  }

  return res;
};
