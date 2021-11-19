import { PlateEditor } from '../PlateEditor';
import { Nullable } from '../utility/Nullable';
import { WithRequired } from '../utility/types';
import { Decorate } from './Decorate';
import { DeserializeHtml } from './DeserializeHtml';
import { DOMHandlers } from './DOMHandlers';
import { InjectComponent } from './InjectComponent';
import { InjectProps } from './InjectProps';
import { OnChange } from './OnChange';
import { PlatePluginComponent } from './PlatePluginComponent';
import { PlatePluginInsertData } from './PlatePluginInsertData';
import { PlatePluginKey, PluginKey } from './PlatePluginKey';
import { PlatePluginProps } from './PlatePluginProps';
import { SerializeHtml } from './SerializeHtml';
import { WithOverride } from './WithOverride';

/**
 * Plate plugin interface built on top of Slate and Editable.
 */
export type PlatePlugin<T = {}, P = {}> = Required<PlatePluginKey> & {
  editor?: Nullable<{
    insertData?: PlatePluginInsertData;
  }>;

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
   * Inject into Plate.
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

    /**
     * Any plugin can use this field to inject code into a stack.
     * For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for `key=KEY_DESERIALIZE_HTML`,
     * `insertData` plugin will call all of these `transformData` for `KEY_DESERIALIZE_HTML` plugin.
     * Differs from `overrideByKey` as this is not overriding any plugin.
     */
    pluginsByKey?: Record<PluginKey, Partial<PlatePlugin<T>>>;
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
  Nullable<{
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
     * HTML deserializer options.
     */
    deserializeHtml?: Nullable<DeserializeHtml> | Nullable<DeserializeHtml>[];

    /**
     * Override (deeply) plugins by key.
     */
    overrideByKey?: Record<PluginKey, Partial<PlatePlugin<T>>>;

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
     * HTML serializer replacing the plugin pluginRenderElement / pipeRenderLeaf.
     */
    serializeHtml?: SerializeHtml;

    /**
     * Recursive plugin merging.
     * Can be used to derive plugin fields from `editor`, `plugin`.
     * The returned value will be deeply merged to the plugin.
     */
    then?: (
      editor: PlateEditor<T>,
      plugin: WithPlatePlugin<T, P>
    ) => Partial<PlatePlugin<T, P>>;

    /**
     * Editor method overriders.
     */
    withOverrides?: WithOverride<T, P>;
  }>;

export type WithPlatePlugin<T = {}, P = {}> = WithRequired<
  PlatePlugin<T, P>,
  'type' | 'options' | 'inject' | 'editor'
>;
