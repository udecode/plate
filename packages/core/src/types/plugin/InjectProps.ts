import { CSSProperties } from 'react';
import { Value } from '@udecode/slate';
import { AnyObject } from '@udecode/utils';

import {
  GetInjectPropsOptions,
  GetInjectPropsReturnType,
} from '../../utils/pluginInjectProps';

export interface TransformOptions<V extends Value = Value>
  extends GetInjectPropsOptions<V> {
  nodeValue?: any;
  value?: any;
}

export interface InjectProps<V extends Value> {
  inject?: {
    /**
     * Properties used by Plate to inject props into any node `component`.
     */
    props?: {
      /**
       * Object whose keys are node values and values are classNames which will be extended.
       */
      classNames?: AnyObject;

      /**
       * Default node value.
       * The node key would be unset if the node value = defaultNodeValue.
       */
      defaultNodeValue?: any;

      /**
       * Node key to map to the styles.
       */
      nodeKey?: string;

      /**
       * Whether to inject the props. If true, overrides all other checks.
       */
      query?: (
        options: NonNullable<NonNullable<InjectProps<V>['inject']>['props']>,
        nodeProps: GetInjectPropsOptions<V>
      ) => boolean;

      /**
       * Style key to override.
       * @default nodeKey
       */
      styleKey?: keyof CSSProperties;

      /**
       * Transform the className.
       * @default clsx(className, classNames[value])
       */
      transformClassName?: (options: TransformOptions<V>) => any;

      /**
       * Transform the node value for the style or className.
       * @default nodeValue
       */
      transformNodeValue?: (options: TransformOptions<V>) => any;

      /**
       * Transform the injected props.
       */
      transformProps?: (
        options: TransformOptions<V>,
        props: GetInjectPropsReturnType
      ) => AnyObject | undefined;

      /**
       * Transform the style.
       * @default { ...style, [styleKey]: value }
       */
      transformStyle?: (options: TransformOptions<V>) => CSSProperties;

      /**
       * List of supported node values.
       */
      validNodeValues?: any[];

      /**
       * Node types required to inject the props.
       * @default [ELEMENT_DEFAULT]
       */
      validTypes?: string[];
    };
  };
}
