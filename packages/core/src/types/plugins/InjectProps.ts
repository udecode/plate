import { CSSProperties } from 'react';
import { GetInjectPropsOptions } from '../../utils/pluginInjectProps';
import { PlateEditor } from '../PlateEditor';
import { AnyObject } from '../utility/AnyObject';

export interface TransformOptions extends GetInjectPropsOptions {
  nodeValue?: any;
}

export interface InjectProps<T = {}> {
  inject?: {
    /**
     * If defined, Plate will use these options to inject props.
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
       * Style key to override.
       * @default nodeKey
       */
      styleKey?: keyof CSSProperties;

      /**
       * Transform the className.
       * @default clsx(className, classNames[value])
       */
      transformClassName?: (
        editor: PlateEditor<T>,
        options: TransformOptions
      ) => any;

      /**
       * Transform the node value for the style or className.
       * @default nodeValue
       */
      transformNodeValue?: (
        editor: PlateEditor<T>,
        options: TransformOptions
      ) => any;

      /**
       * Transform the style.
       * @default { ...style, [styleKey]: value }
       */
      transformStyle?: (
        editor: PlateEditor<T>,
        options: TransformOptions
      ) => CSSProperties;

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
