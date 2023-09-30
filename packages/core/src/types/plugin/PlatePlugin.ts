import { FC, ReactNode } from 'react';
import { Value } from '@udecode/slate';
import { AnyObject, WithRequired } from '@udecode/utils';

import { Nullable } from '../misc';
import { PlateEditor } from '../PlateEditor';
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
import { RenderAfterEditable } from './RenderAfterEditable';
import { SerializeHtml } from './SerializeHtml';
import { WithOverride } from './WithOverride';

/**
 * The `PlatePlugin` interface is a base interface for all plugins.
 */
export type PlatePlugin<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = Required<PlatePluginKey> & {
  editor?: Nullable<{
    /**
     * Properties used by the `insertData` core plugin to deserialize inserted data to a slate fragment.
     * The fragment will be inserted to the editor if not empty.
     */
    insertData?: PlatePluginInsertData<V>;
  }>;

  /**
   * Handlers called whenever the corresponding event occurs in the editor.
   * Event handlers can return a boolean flag to specify whether the event can be treated as being handled.
   * If it returns `true`, the next handlers will not be called.
   */
  handlers?: Nullable<
    DOMHandlers<P, V, E> & {
      /**
       * @see {@link OnChange}
       */
      onChange?: OnChange<P, V, E>;
    }
  >;

  /**
   * Inject into Plate.
   */
  inject?: Nullable<{
    /**
     * Property used by Plate to inject a component above other plugins `component`.
     */
    aboveComponent?: InjectComponent<V>;

    /**
     * Property used by Plate to inject a component below other plugins `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent<V>;

    /**
     * Property that can be used by a plugin to allow other plugins to inject code.
     * For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for `key=KEY_DESERIALIZE_HTML`,
     * `insertData` plugin will call all of these `transformData` for `KEY_DESERIALIZE_HTML` plugin.
     * Differs from `overrideByKey` as this is not overriding any plugin.
     */
    pluginsByKey?: Record<PluginKey, Partial<PlatePlugin<PluginOptions, V, E>>>;
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
   * Property used by `isMarkableVoid` core plugin to set void elements of this `type` as markable.
   */
  isMarkableVoid?: boolean;

  /**
   * Property used by Plate to render nodes of this `type` as leaves, i.e. `renderLeaf`.
   */
  isLeaf?: boolean;

  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as void.
   */
  isVoid?: boolean;

  /**
   * Property used by Plate to enable/disable the plugin.
   */
  enabled?: boolean;

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
} & InjectProps<V> &
  Nullable<{
    /**
     * React component rendering a slate element or leaf.
     * @default DefaultElement | DefaultLeaf
     */
    component?: PlatePluginComponent;

    /**
     * @see {@link Decorate}
     */
    decorate?: Decorate<P, V, E>;

    /**
     * Properties used by the HTML deserializer core plugin for each HTML element.
     */
    deserializeHtml?: Nullable<DeserializeHtml>;

    /**
     * Normalize initial value before passing it into the editor.
     * @return normalized value
     */
    normalizeInitialValue?: (initialValue: V) => V;

    /**
     * Property used by Plate to deeply override plugins by key.
     */
    overrideByKey?: Record<
      PluginKey,
      Partial<PlatePlugin<PluginOptions, V, E>>
    >;

    /**
     * Recursive plugin support to allow having multiple plugins in a single plugin.
     * Plate eventually flattens all the plugins into the editor.
     */
    plugins?: PlatePlugin<PluginOptions, V, E>[];

    /**
     * Property used by Plate to override node `component` props.
     * If function, its returning value will be shallow merged to the old props, with the old props as parameter.
     * If object, its value will be shallow merged to the old props.
     */
    props?: PlatePluginProps<V>;

    /**
     * Render a component above `Editable`.
     */
    renderAboveEditable?: FC<{
      children: ReactNode;
    }>;

    /**
     * Render a component above `Slate`.
     */
    renderAboveSlate?: FC<{
      children: ReactNode;
    }>;

    /**
     * Render a component after `Editable`.
     */
    renderAfterEditable?: RenderAfterEditable;

    /**
     * Render a component before `Editable`.
     */
    renderBeforeEditable?: RenderAfterEditable;

    /**
     * Property used by `serializeHtml` util to replace `renderElement` and `renderLeaf` when serializing a node of this `type`.
     */
    serializeHtml?: SerializeHtml<V>;

    /**
     * Recursive plugin merging.
     * Can be used to derive plugin fields from `editor` and `plugin`.
     * The returned value will be deeply merged to the plugin.
     */
    then?: (
      editor: E,
      plugin: WithPlatePlugin<P, V, E>
    ) => Partial<PlatePlugin<PluginOptions, V, E>> | undefined | void;

    /**
     * For internal use. Tracks if then has been replaced for recursive calls.
     */
    _thenReplaced?: number;

    /**
     * Hook called when the editor is initialized.
     */
    useHooks?: (editor: E, plugin: WithPlatePlugin<P, V, E>) => void;

    /**
     * Editor method overriders.
     */
    withOverrides?: WithOverride<P, V, E>;
  }>;

export type PluginOptions = AnyObject;

export type WithPlatePlugin<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = WithRequired<
  PlatePlugin<P, V, E>,
  'type' | 'options' | 'inject' | 'editor'
>;

export type { AnyObject } from '@udecode/utils';
