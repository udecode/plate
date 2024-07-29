import type React from 'react';

import type { AnyObject } from '@udecode/utils';

import type {
  GetInjectPropsOptions,
  GetInjectPropsReturnType,
} from '../../utils/pluginInjectProps';

export interface TransformOptions extends GetInjectPropsOptions {
  nodeValue?: any;
  value?: any;
}

export interface InjectProps {
  inject?: {
    /** Properties used by Plate to inject props into any node `component`. */
    props?: {
      /**
       * Object whose keys are node values and values are classNames which will
       * be extended.
       */
      classNames?: AnyObject;

      /**
       * Default node value. The node key would be unset if the node value =
       * defaultNodeValue.
       */
      defaultNodeValue?: any;

      /** Node key to map to the styles. */
      nodeKey?: string;

      /** Whether to inject the props. If true, overrides all other checks. */
      query?: (
        options: NonNullable<NonNullable<InjectProps['inject']>['props']>,
        nodeProps: GetInjectPropsOptions
      ) => boolean;

      /**
       * Style key to override.
       *
       * @default nodeKey
       */
      styleKey?: keyof React.CSSProperties;

      /**
       * Transform the className.
       *
       * @default clsx(className, classNames[value])
       */
      transformClassName?: (options: TransformOptions) => any;

      /**
       * Transform the node value for the style or className.
       *
       * @default nodeValue
       */
      transformNodeValue?: (options: TransformOptions) => any;

      /** Transform the injected props. */
      transformProps?: (
        options: TransformOptions,
        props: GetInjectPropsReturnType
      ) => AnyObject | undefined;

      /**
       * Transform the style.
       *
       * @default { ...style, [styleKey]: value }
       */
      transformStyle?: (options: TransformOptions) => React.CSSProperties;

      /** List of supported node values. */
      validNodeValues?: any[];

      /**
       * Node types required to inject the props.
       *
       * @default [ELEMENT_DEFAULT]
       */
      validTypes?: string[];
    };
  };
}
