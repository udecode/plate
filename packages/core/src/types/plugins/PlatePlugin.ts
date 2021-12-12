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
 * The `PlatePlugin` interface is a base interface for all plugins.
 */
export type PlatePlugin<T = {}, P = {}> = Required<PlatePluginKey> & {
  editor?: Nullable<{
    /**
     * Properties used by the `insertData` core plugin to deserialize inserted data to a slate fragment.
     * The fragment will be inserted to the editor if not empty.
     */
    insertData?: PlatePluginInsertData;
  }>;

  /**
   * Handlers called whenever the corresponding event occurs in the editor.
   * Event handlers can return a boolean flag to specify whether the event can be treated as being handled.
   * If it returns `true`, the next handlers will not be called.
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
     * Property used by Plate to inject a component above other plugins `component`.
     */
    aboveComponent?: InjectComponent;

    /**
     * Property used by Plate to inject a component below other plugins `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent;

    /**
     * Property that can be used by a plugin to allow other plugins to inject code.
     * For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for `key=KEY_DESERIALIZE_HTML`,
     * `insertData` plugin will call all of these `transformData` for `KEY_DESERIALIZE_HTML` plugin.
     * Differs from `overrideByKey` as this is not overriding any plugin.
     */
    pluginsByKey?: Record<PluginKey, Partial<PlatePlugin<T>>>;
  }>;

  /**
   * Property used by Plate to render nodes of this `type` as elements, i.e. `renderElement`.
   */
  isElement?: boolean;

  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as inline.
   */
  isInline?: boolean;

  /**
   * Property used by Plate to render nodes of this `type` as leaves, i.e. `renderLeaf`.
   */
  isLeaf?: boolean;

  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as void.
   */
  isVoid?: boolean;

  /**
   * Extended properties used by any plugin as options.
   */
  options?: P;

  /**
   * Property used by Plate to render a node by type.
   * It requires slate node properties to have a `type` property.
   * @default key
   */
  type?: string;
} & InjectProps &
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
     * Properties used by the HTML deserializer core plugin for each HTML element.
     */
    deserializeHtml?: Nullable<DeserializeHtml>;

    /**
     * Property used by Plate to deeply override plugins by key.
     */
    overrideByKey?: Record<PluginKey, Partial<PlatePlugin<T>>>;

    /**
     * Recursive plugin support to allow having multiple plugins in a single plugin.
     * Plate eventually flattens all the plugins into the editor.
     */
    plugins?: PlatePlugin<T>[];

    /**
     * Property used by Plate to override node `component` props.
     * If function, its returning value will be shallow merged to the old props, with the old props as parameter.
     * If object, its value will be shallow merged to the old props.
     */
    props?: PlatePluginProps;

    /**
     * Property used by `serializeHtml` util to replace `renderElement` and `renderLeaf` when serializing a node of this `type`.
     */
    serializeHtml?: SerializeHtml;

    /**
     * Recursive plugin merging.
     * Can be used to derive plugin fields from `editor` and `plugin`.
     * The returned value will be deeply merged to the plugin.
     */
    then?: (
      editor: PlateEditor<T>,
      plugin: WithPlatePlugin<T, P>
    ) => Partial<PlatePlugin<T, P>> | void;

    useHooks?: (editor: PlateEditor<T>, plugin: WithPlatePlugin<T, P>) => void;

    /**
     * Editor method overriders.
     */
    withOverrides?: WithOverride<T, P>;
  }>;

export type WithPlatePlugin<T = {}, P = {}> = WithRequired<
  PlatePlugin<T, P>,
  'type' | 'options' | 'inject' | 'editor'
>;
