import { PlateEditor } from '../../PlateEditor';
import { Nullable } from '../../utility/Nullable';
import { WithRequired } from '../../utility/types';
import { PlatePluginSerializer } from '../SerializePlugin/PlatePluginSerializer';
import { Decorate } from './Decorate';
import { DOMHandlers } from './DOMHandlers';
import { InjectComponent } from './InjectComponent';
import { InjectProps } from './InjectProps';
import { OnChange } from './OnChange';
import { PlatePluginComponent } from './PlatePluginComponent';
import { PlatePluginKey } from './PlatePluginKey';
import { PlatePluginProps } from './PlatePluginProps';
import { WithOverride } from './WithOverride';

/**
 * Plate plugin interface built on top of Slate and Editable.
 */
export type PlatePlugin<T = {}, P = {}> = Required<PlatePluginKey> & {
  /**
   * DOM handler props.
   */
  handlers?: Nullable<
    DOMHandlers<T, P> & {
      /**
       * @see {@link OnChange}
       */
      onChange?: OnChange<T, P>;
    }
  >;

  /**
   * Inject into other plugins.
   */
  inject?: Nullable<{
    /**
     * Inject component above any node `component`.
     */
    aboveComponent?: InjectComponent;

    /**
     * Inject component above any node `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent;
  }>;

  /**
   * Whether it's an element plugin (`renderElement`).
   */
  isElement?: boolean;

  /**
   * Whether the element is inline.
   */
  isInline?: boolean;

  /**
   * Whether it's a leaf plugin (`renderLeaf`).
   */
  isLeaf?: boolean;

  /**
   * Whether the element is void.
   */
  isVoid?: boolean;

  options?: P;

  /**
   * Element or mark type.
   * @default key
   */
  type?: string;
} & InjectProps<T> &
  Nullable<
    PlatePluginSerializer<T, P> & {
      /**
       * React component rendering a slate element or leaf.
       * @default DefaultElement | DefaultLeaf
       */
      component?: PlatePluginComponent;

      /**
       * @see {@link Decorate}
       */
      decorate?: Decorate<T, P>;

      /**
       * Recursive plugin support.
       * Can be used to pack multiple plugins.
       * Plate eventually flats all the plugins into `editor.plugins`.
       */
      plugins?: PlatePlugin<T>[];

      /**
       * Override node `component` props. Props object or function with props parameters returning the new props.
       */
      props?: PlatePluginProps;

      /**
       * Recursive plugin merging.
       * Can be used to derive plugin fields from `editor`, `plugin`.
       * The returned value will be deeply merged to the plugin.
       */
      then?: (
        editor: PlateEditor<T>,
        plugin: PlatePlugin<T, P>
      ) => Partial<PlatePlugin<T, P>>;

      /**
       * Editor method overriders.
       */
      withOverrides?: WithOverride<T, P>;
    }
  >;

export type WithPlatePlugin<T = {}, P = {}> = WithRequired<
  PlatePlugin<T, P>,
  'type' | 'options' | 'inject'
>;
