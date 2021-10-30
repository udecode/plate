import { CSSProperties } from 'react';
import {
  getPlatePluginOptions,
  OverrideProps,
  TElement,
  TText,
} from '@udecode/plate-core';
import clsx from 'clsx';
import { OverridePropsOptions } from '../types';

export interface GetOverridePropsOptions {
  pluginKey?: string;

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

export const getOverrideProps = (pluginKey: string): OverrideProps => (
  editor
) => (
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
  } = getPlatePluginOptions<OverridePropsOptions>(editor, pluginKey);

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

  if (classNames?.[nodeValue]) {
    res.className =
      transformClassName?.(editor, transformOptions) ??
      clsx(className, classNames[value]);
  }

  if (styleKey) {
    res.style = transformStyle?.(editor, transformOptions) ?? {
      ...style,
      [styleKey as string]: value,
    };
  }

  return res;
};
