import type React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../PlateEditor';
import type { Nullable } from '../misc';
import type { DOMHandlers } from './DOMHandlers';
import type { Decorate } from './Decorate';
import type { DeserializeHtml } from './DeserializeHtml';
import type { InjectComponent } from './InjectComponent';
import type { InjectProps } from './InjectProps';
import type { OnChange } from './OnChange';
import type { PlatePluginComponent } from './PlatePluginComponent';
import type { PlatePluginInsertData } from './PlatePluginInsertData';
import type { PlatePluginKey, PluginKey } from './PlatePluginKey';
import type { PlatePluginProps } from './PlatePluginProps';
import type { PlatePluginUseHooks } from './PlatePluginUseHooks';
import type { RenderAfterEditable } from './RenderAfterEditable';
import type { SerializeHtml } from './SerializeHtml';
import type { WithOverride } from './WithOverride';

export type PlatePluginConfigure<O = {}, T = {}, Q = {}, S = {}> = (
  options: O
) => PlatePlugin<O, T, Q, S>;

export type PlatePluginMethods<O = {}, T = {}, Q = {}, S = {}> = {
  __extensions: ((
    editor: PlateEditor,
    plugin: PlatePlugin<O, T, Q, S>
  ) => Partial<PlatePlugin<O, T, Q, S>>)[];

  configure: PlatePluginConfigure<O, T, Q, S>;

  extend: <EO = {}, ET = {}, EQ = {}, ES = {}>(
    extendConfig:
      | (<EO = {}, ET = {}, EQ = {}, ES = {}>(
          editor: PlateEditor,
          plugin: PlatePlugin<O, T, Q, S>
        ) => Partial<PlatePlugin<EO, ET, EQ, ES>>)
      | Partial<PlatePlugin<EO, ET, EQ, ES>>
  ) => PlatePlugin<EO & O, ET & T, EQ & Q, ES & S>;

  extendPlugin: <EO = {}, ET = {}, EQ = {}, ES = {}>(
    key: string,
    extendConfig:
      | (<EO = {}, ET = {}, EQ = {}, ES = {}>(
          editor: PlateEditor,
          plugin: PlatePlugin<O, T, Q, S>
        ) => Partial<PlatePlugin<EO, ET, EQ, ES>>)
      | Partial<PlatePlugin<EO, ET, EQ, ES>>
  ) => PlatePlugin<O, T, Q, S>;
};

/** The `PlatePlugin` interface is a base interface for all plugins. */
export type PlatePlugin<O = {}, T = {}, Q = {}, S = {}> = {
  editor: {
    /**
     * Properties used by the `insertData` core plugin to deserialize inserted
     * data to a slate fragment. The fragment will be inserted to the editor if
     * not empty.
     */
    insertData?: PlatePluginInsertData;
  };

  /** Property used by Plate to enable/disable the plugin. */
  enabled?: boolean;
  /**
   * Handlers called whenever the corresponding event occurs in the editor.
   * Event handlers can return a boolean flag to specify whether the event can
   * be treated as being handled. If it returns `true`, the next handlers will
   * not be called.
   */
  handlers?: {
    /** @see {@link OnChange} */
    onChange?: OnChange<O, T, Q, S>;
  } & DOMHandlers<O, T, Q, S>;

  /** Inject into Plate. */
  inject: {
    /**
     * Property used by Plate to inject a component above other plugins
     * `component`.
     */
    aboveComponent?: InjectComponent;

    /**
     * Property used by Plate to inject a component below other plugins
     * `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent;

    /**
     * Property that can be used by a plugin to allow other plugins to inject
     * code. For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for `key=KEY_DESERIALIZE_HTML`,
     * `insertData` plugin will call all of these `transformData` for
     * `KEY_DESERIALIZE_HTML` plugin. Differs from `overrideByKey` as this is
     * not overriding any plugin.
     */
    pluginsByKey?: Record<PluginKey, Partial<PlatePlugin>>;
  };

  /**
   * Property used by Plate to render nodes of this `type` as elements, i.e.
   * `renderElement`.
   */
  isElement?: boolean;

  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as
   * inline.
   */
  isInline?: boolean;

  /**
   * Property used by Plate to render nodes of this `type` as leaves, i.e.
   * `renderLeaf`.
   */
  isLeaf?: boolean;

  /**
   * Property used by `isMarkableVoid` core plugin to set void elements of this
   * `type` as markable.
   */
  isMarkableVoid?: boolean;

  /**
   * Property used by `inlineVoid` core plugin to set elements of this `type` as
   * void.
   */
  isVoid?: boolean;

  /** Extended properties used by any plugin as options. */
  options: O;

  /**
   * Recursive plugin support to allow having multiple plugins in a single
   * plugin. Plate eventually flattens all the plugins into the editor.
   */
  plugins: PlatePlugin<O, T, Q, S>[];

  queries: Q;

  transforms: T;

  /**
   * Property used by Plate to render a node by type. It requires slate node
   * properties to have a `type` property.
   *
   * @default key
   */
  type: string;
} & InjectProps &
  Nullable<{
    /**
     * React component rendering a slate element or leaf.
     *
     * @default DefaultElement | DefaultLeaf
     */
    component?: PlatePluginComponent;

    /** @see {@link Decorate} */
    decorate?: Decorate<O, T, Q, S>;

    /**
     * Properties used by the HTML deserializer core plugin for each HTML
     * element.
     */
    deserializeHtml?: Nullable<DeserializeHtml>;

    /**
     * Normalize initial value before passing it into the editor.
     *
     * @returns Normalized value
     */
    normalizeInitialValue?: (initialValue: Value) => Value;

    /** Property used by Plate to deeply override plugins by key. */
    overrideByKey?: Record<PluginKey, Partial<PlatePlugin<O, T, Q, S>>>;

    /**
     * Property used by Plate to override node `component` props. If function,
     * its returning value will be shallow merged to the old props, with the old
     * props as parameter. If object, its value will be shallow merged to the
     * old props.
     */
    props?: PlatePluginProps;

    /** Render a component above `Editable`. */
    renderAboveEditable?: React.FC<{
      children: React.ReactNode;
    }>;

    /** Render a component above `Slate`. */
    renderAboveSlate?: React.FC<{
      children: React.ReactNode;
    }>;

    /** Render a component after `Editable`. */
    renderAfterEditable?: RenderAfterEditable;

    /** Render a component before `Editable`. */
    renderBeforeEditable?: RenderAfterEditable;

    /**
     * Property used by `serializeHtml` util to replace `renderElement` and
     * `renderLeaf` when serializing a node of this `type`.
     */
    serializeHtml?: SerializeHtml;

    // /**
    //  * Recursive plugin merging. Can be used to derive plugin fields from
    //  * `editor` and `plugin`. The returned value will be deeply merged to the
    //  * plugin.
    //  */
    // then?: (
    //   editor: PlateEditor,
    //   plugin: PlatePlugin<O, T, Q, S>
    // ) => Partial<PlatePlugin<O, T, Q, S>> | undefined | void;

    /** Hook called when the editor is initialized. */
    useHooks?: PlatePluginUseHooks<O, T, Q, S>;

    /** Editor method overriders. */
    withOverrides?: WithOverride<O, T, Q, S>;
  }> &
  PlatePluginMethods<O, T, Q, S> &
  Required<PlatePluginKey>;
