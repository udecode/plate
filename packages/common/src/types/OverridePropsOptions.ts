import { CSSProperties } from 'react';
import { AnyObject, PlateEditor } from '@udecode/plate-core';
import { GetOverridePropsOptions } from '../utils/getOverrideProps';

export interface TransformOptions extends GetOverridePropsOptions {
  nodeValue?: any;
}

export interface OverridePropsOptions<TValue = any> {
  /**
   * Object whose keys are node values and values are classNames which will be extended.
   */
  classNames?: AnyObject;

  /**
   * Default node value.
   * The node key would be unset if the node value = defaultNodeValue.
   */
  defaultNodeValue?: TValue;

  /**
   * Node key to map to the styles.
   */
  nodeKey?: string;

  /**
   * Style key to override.
   * @default nodeKey
   */
  styleKey?: keyof CSSProperties;

  /**
   * Transforms the className.
   * @default clsx(className, classNames[value])
   */
  transformClassName?: (editor: PlateEditor, options: TransformOptions) => any;

  /**
   * Transforms the node value for the style or className.
   * @default nodeValue
   */
  transformNodeValue?: (
    editor: PlateEditor,
    options: TransformOptions
  ) => TValue;

  /**
   * Transforms the style.
   * @default { ...style, [styleKey]: value }
   */
  transformStyle?: (
    editor: PlateEditor,
    options: TransformOptions
  ) => CSSProperties;

  /**
   * List of supported node values.
   */
  validNodeValues?: TValue[];

  /**
   * List of element types for which the overrides apply.
   * @default [ELEMENT_DEFAULT]
   */
  validTypes?: string[];
}
