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
import type { PluginKey } from './PlatePluginKey';
import type { PlatePluginProps } from './PlatePluginProps';
import type { PlatePluginUseHooks } from './PlatePluginUseHooks';
import type { RenderAfterEditable } from './RenderAfterEditable';
import type { SerializeHtml } from './SerializeHtml';
import type { WithOverride } from './WithOverride';

export type PlatePluginMethods<
  K extends string = '',
  O = {},
  A = {},
  T = {},
  S = {},
> = {
  __extensions: ((
    ctx: PlatePluginContext<K, O, A, T, S>
  ) => Partial<PlatePlugin<K, O, A, T, S>>)[];

  configure: (
    options:
      | ((ctx: PlatePluginContext<K, O, A, T, S>) => Partial<O>)
      | Partial<O>
  ) => PlatePlugin<K, O, A, T, S>;

  configurePlugin: <EO = {}>(
    key: string,
    options:
      | ((ctx: PlatePluginContext<K, O, A, T, S>) => Partial<EO>)
      | Partial<EO>
  ) => PlatePlugin<K, O, A, T, S>;

  extend: <EO = {}, EA = {}, ET = {}, ES = {}>(
    extendConfig:
      | ((
          ctx: PlatePluginContext<K, O, A, T, S>
        ) => Partial<
          PlatePlugin<
            K,
            EO & Partial<O>,
            EA & Partial<A>,
            ET & Partial<T>,
            ES & Partial<S>
          >
        >)
      | Partial<
          PlatePlugin<
            K,
            EO & Partial<O>,
            EA & Partial<A>,
            ET & Partial<T>,
            ES & Partial<S>
          >
        >
  ) => PlatePlugin<K, EO & O, A & EA, ET & T, ES & S>;

  extendPlugin: <EO = {}, EA = {}, ET = {}, ES = {}>(
    key: string,
    extendConfig:
      | ((
          ctx: PlatePluginContext<K, O, A, T, S>
        ) => Partial<PlatePlugin<K, EO, EA, ET, ES>>)
      | Partial<PlatePlugin<K, EO, EA, ET, ES>>
  ) => PlatePlugin<K, O, A, T, S>;

  /**
   * Set the component for the plugin.
   *
   * @param component The React component to be used for rendering.
   * @returns A new instance of the plugin with the updated component.
   */
  withComponent: (
    component: PlatePluginComponent
  ) => PlatePlugin<K, O, A, T, S>;
};

/** The `PlatePlugin` interface is a base interface for all plugins. */
export type PlatePlugin<
  K extends string = string,
  O = {},
  A = {},
  T = {},
  S = {},
> = {
  api: A;

  /**
   * An array of plugin keys that this plugin depends on. These plugins will be
   * loaded before the current plugin.
   */
  dependencies: string[];

  editor: {
    /**
     * Properties used by the `insertData` core plugin to deserialize inserted
     * data to a slate fragment. The fragment will be inserted to the editor if
     * not empty.
     */
    insertData?: PlatePluginInsertData<O, A, T, S>;
  };

  /** Property used by Plate to enable/disable the plugin. */
  enabled?: boolean;
  /**
   * Handlers called whenever the corresponding event occurs in the editor.
   * Event handlers can return a boolean flag to specify whether the event can
   * be treated as being handled. If it returns `true`, the next handlers will
   * not be called.
   */
  handlers: {
    /** @see {@link OnChange} */
    onChange?: OnChange<O, A, T, S>;
  } & DOMHandlers<O, A, T, S>;

  /** Inject into Plate. */
  inject: {
    /**
     * Property used by Plate to inject a component above other plugins
     * `component`.
     */
    aboveComponent?: InjectComponent<O, A, T, S>;

    /**
     * Property used by Plate to inject a component below other plugins
     * `component`, i.e. above its `children`.
     */
    belowComponent?: InjectComponent<O, A, T, S>;

    /**
     * Property that can be used by a plugin to allow other plugins to inject
     * code. For example, if multiple plugins have defined
     * `inject.editor.insertData.transformData` for `key=KEY_DESERIALIZE_HTML`,
     * `insertData` plugin will call all of these `transformData` for
     * `KEY_DESERIALIZE_HTML` plugin. Differs from `override.plugins` as this is
     * not overriding any plugin.
     */
    pluginsByKey?: Record<
      PluginKey,
      Partial<PlatePlugin<any, any, any, any, any>>
    >;
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

  key: K;

  /** Extended properties used by any plugin as options. */
  options: O;

  override: {
    /** Replace plugin components by key. */
    components?: Record<PluginKey, PlatePluginComponent>;

    /** Enable or disable plugins */
    enabled?: Partial<Record<string, boolean>>;

    /** Extend plugins by key. */
    plugins?: Record<PluginKey, Partial<PlatePlugin<any, any, any, any, any>>>;
  };

  /**
   * Recursive plugin support to allow having multiple plugins in a single
   * plugin. Plate eventually flattens all the plugins into the editor.
   */
  plugins: PlatePluginList;

  /**
   * Defines the order in which plugins are registered and executed.
   *
   * Plugins with higher priority values are registered and executed before
   * those with lower values. This affects two main aspects:
   *
   * 1. Plugin Order: Plugins with higher priority will be added to the editor
   *    earlier.
   * 2. Execution Order: For operations that involve multiple plugins (e.g., editor
   *    methods), plugins with higher priority will be processed first.
   *
   * @default 100
   */
  priority: number;

  /** Transforms (state-modifying operations) that can be applied to the editor. */
  transforms: T;

  /**
   * Property used by Plate to render a node by type. It requires slate node
   * properties to have a `type` property.
   *
   * @default key
   */
  type: string;
} & InjectProps<O, A, T, S> &
  Nullable<{
    /**
     * React component rendering a slate element or leaf.
     *
     * @default DefaultElement | DefaultLeaf
     */
    component?: PlatePluginComponent;

    /** @see {@link Decorate} */
    decorate?: Decorate<O, A, T, S>;

    /**
     * Properties used by the HTML deserializer core plugin for each HTML
     * element.
     */
    deserializeHtml?: Nullable<DeserializeHtml<O, A, T, S>>;

    /**
     * Normalize initial value before passing it into the editor.
     *
     * @returns Normalized value
     */
    normalizeInitialValue?: (
      ctx: { value: Value } & PlatePluginContext<string, O, A, T, S>
    ) => Value;

    /**
     * Property used by Plate to override node `component` props. If function,
     * its returning value will be shallow merged to the old props, with the old
     * props as parameter. If object, its value will be shallow merged to the
     * old props.
     */
    props?: PlatePluginProps<O, A, T, S>;

    /** Render a component above `Editable`. */
    renderAboveEditable?: React.FC<{ children: React.ReactNode }>;

    /** Render a component above `Slate`. */
    renderAboveSlate?: React.FC<{ children: React.ReactNode }>;

    /** Render a component after `Editable`. */
    renderAfterEditable?: RenderAfterEditable;

    /** Render a component before `Editable`. */
    renderBeforeEditable?: RenderAfterEditable;

    /**
     * Property used by `serializeHtml` util to replace `renderElement` and
     * `renderLeaf` when serializing a node of this `type`.
     */
    serializeHtml?: SerializeHtml<O, A, T, S>;

    /** Hook called when the editor is initialized. */
    useHooks?: PlatePluginUseHooks<O, A, T, S>;

    /** Editor method overriders. */
    withOverrides?: WithOverride<O, A, T, S>;
  }> &
  PlatePluginMethods<K, O, A, T, S>;

export type AnyPlatePlugin = PlatePlugin<any, any, any, any, any>;

export type PlatePluginList = AnyPlatePlugin[];

export type PlatePluginContext<
  K extends string = '',
  O = {},
  A = {},
  T = {},
  S = {},
> = {
  editor: PlateEditor;
  plugin: PlatePlugin<K, O, A, T, S>;
};
