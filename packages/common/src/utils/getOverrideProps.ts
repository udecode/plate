import { CSSProperties } from 'react';
import {
  getPlatePluginOptions,
  OverrideProps,
  PlatePluginKey,
  TElement,
  TText,
} from '@udecode/plate-core';
import clsx from 'clsx';
import { OverridePropsOptions } from '../types';

export interface GetOverridePropsOptions extends PlatePluginKey {
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

export interface OverridePropsReturnType {
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
export const getOverrideProps = (key: string): OverrideProps => (editor) => (
  options: GetOverridePropsOptions
): OverridePropsReturnType | undefined => {
  const { element, text, className, style } = options;

  const node = element ?? text;
  if (!node) return;

  const {
    nodeKey,
    styleKey = nodeKey as any,
    validTypes,
    classNames,
    transformClassName,
    transformNodeValue,
    transformStyle,
    validNodeValues,
  } = getPlatePluginOptions<OverridePropsOptions>(editor, key);

  if (!nodeKey) return;

  if (validTypes && node.type && !validTypes.includes(node.type)) {
    return;
  }

  const nodeValue = node[nodeKey];

  // early return if there is now reason to add styles
  if (!nodeValue || (validNodeValues && !validNodeValues.includes(nodeValue))) {
    return;
  }

  const res: OverridePropsReturnType = {};

  const transformOptions = { ...options, nodeValue };

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
