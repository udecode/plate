import { CSSProperties } from 'react';
import { getPlatePluginOptions, SPEditor } from '@udecode/plate-core';
import clsx, { ClassDictionary } from 'clsx';
import { NodeOverridePropsOptions } from '../types';

export interface NodeOverridePropsReturnType {
  className?: string;
  style?: CSSProperties;
}

export function getNodeOverrideProps(
  editor: SPEditor,
  {
    defaultOption,
    options,
    classNames,
    value,
    className,
    style,
    type,
  }: NodeOverridePropsOptions
): NodeOverridePropsReturnType {
  // early return if there is now reason to add styles
  if (
    // value not set
    !(value ?? false) ||
    // has a default option and value matches it
    (defaultOption !== undefined && value === defaultOption) ||
    // options are provided and value is not one of them
    (options && !options.includes(value))
  ) {
    return {};
  }

  const pluginOptions = getPlatePluginOptions(editor, type);
  const { cssPropName, transformCssValue } = pluginOptions;

  const res: NodeOverridePropsReturnType = {};

  if (classNames?.[value]) {
    res.className = clsx(className, classNames[value] as ClassDictionary);
  } else {
    res.style = {
      ...style,
      [cssPropName ?? type]:
        transformCssValue && typeof transformCssValue === 'function'
          ? transformCssValue({ options: pluginOptions, value })
          : value,
    };
  }

  return res;
}
