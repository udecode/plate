// Core type contracts for base plugins and their editor extensions.
import {
  HistoryPlugin,
  type ExtendConfig,
  type ParserOptions,
  type PluginConfig,
  createBaseEditor,
  createBasePlugin,
  getEditorPlugin,
  prepareInsertDataQuery,
} from '@platejs/core';
import { defineEditorExtension } from '@platejs/plite';
import { history } from '@platejs/plite-history';

const baseSingleExtension = defineEditorExtension({
  name: 'base-single-extension',
});
const baseArrayExtension = defineEditorExtension({
  name: 'base-array-extension',
});
const baseFactoryExtension = defineEditorExtension({
  name: 'base-factory-extension',
});

const BoldPlugin = createBasePlugin({
  key: 'bold',
  options: {
    enabled: true as const,
    hotkey: 'mod+b',
  },
})
  .extendExtension(baseSingleExtension)
  .extendEditorApi(({ getOptions }) => ({
    toggleBold: () => getOptions().hotkey,
  }));

type CalloutConfig = PluginConfig<
  'callout',
  {
    dismissible?: boolean;
    variant: 'info' | 'warning';
  },
  {
    setVariant: (variant: 'info' | 'warning') => void;
  }
>;

type ExtendConfigBase = PluginConfig<
  'extendConfig',
  { baseOption: true },
  { baseApi: () => 'base' },
  { extendConfig: { baseTx: () => void } },
  { baseSelector: () => boolean },
  { baseState: 'base' }
>;

type ExtendedFullConfig = ExtendConfig<
  ExtendConfigBase,
  { extraOption: 1 },
  { extraApi: () => 2 },
  { extendConfig: { extraTx: (value: 'tx') => void } },
  { extraSelector: () => 3 },
  { extraState: 4 }
>;

const CalloutPlugin = createBasePlugin<CalloutConfig>({
  key: 'callout',
  options: {
    dismissible: false,
    variant: 'info',
  },
})
  .extendEditorApi(({ setOption }) => ({
    setVariant: (variant) => {
      setOption('variant', variant);
    },
  }))
  .extendApi(({ getOptions }) => ({
    getVariant: () => getOptions().variant,
  }));

const ConfiguredCalloutPlugin = CalloutPlugin.extend({
  options: {
    dismissible: true,
  },
})
  .extendExtension(baseArrayExtension)
  .configure({
    options: {
      variant: 'warning',
    },
  });

CalloutPlugin.configure(({ getOptions, plugin }) => {
  const configuredVariant: 'info' | 'warning' = getOptions().variant;
  const configuredDismissible: boolean | undefined = plugin.options.dismissible;

  void configuredDismissible;
  void configuredVariant;

  return { options: { variant: 'warning' } };
});

const ShortcutTargetPlugin = createBasePlugin({
  key: 'shortcutTargetContracts',
})
  .extendTx(() => () => ({
    both: () => true,
    update: () => true,
  }))
  .extendApi(() => ({
    api: () => true,
    both: () => true,
  }));

type DeclaredBaseTx = {
  run: (value: 'typed', options?: { count?: number }) => number;
};

const DeclaredBaseTxPlugin = createBasePlugin({
  key: 'declaredBaseTx',
}).extendTx<DeclaredBaseTx>(() => () => ({
  run: (value, options = {}) => {
    const exactValue: 'typed' = value;
    const exactCount: number | undefined = options.count;

    return exactValue.length + (exactCount ?? 0);
  },
}));

void DeclaredBaseTxPlugin;

ShortcutTargetPlugin.extend({
  shortcuts: {
    api: { keys: 'mod+a' },
    both: { keys: 'mod+b', target: 'api' },
    custom: { handler: () => true, keys: 'mod+c' },
    update: { keys: 'mod+u' },
  },
});

const ShortcutApiScopeCollisionPlugin = ShortcutTargetPlugin.extendEditorApi(
  () => ({
    api: () => true,
  })
);

ShortcutApiScopeCollisionPlugin.extend({
  shortcuts: {
    // @ts-expect-error Plugin/editor API collisions require a custom handler.
    api: { keys: 'mod+a', target: 'api' },
  },
});

createBasePlugin<
  PluginConfig<
    'explicitShortcutContracts',
    {},
    {},
    { explicitShortcutContracts: { run: () => boolean } }
  >
>({
  key: 'explicitShortcutContracts',
  // @ts-expect-error Explicitly typed factories declare shortcuts after capabilities.
  shortcuts: { run: { keys: 'mod+r' } },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error Update/API collisions require an explicit target.
    both: { keys: 'mod+b' },
  },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error Unknown commands require a custom handler.
    missing: { keys: 'mod+m' },
  },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error API-only commands cannot target update.
    api: { keys: 'mod+a', target: 'update' },
  },
});

ShortcutTargetPlugin.extend({
  shortcuts: {
    // @ts-expect-error Custom handlers own routing and reject target.
    invalidHandlerTarget: {
      handler: () => true,
      keys: 'mod+i',
      target: 'api',
    },
  },
});

const FactoryExtensionPlugin = createBasePlugin({
  key: 'factoryExtension',
  options: {
    enabled: true,
  },
}).extendExtension(({ getOptions }) => {
  const enabled: boolean = getOptions().enabled;

  void enabled;

  return [baseFactoryExtension] as const;
});

createBasePlugin({
  handlers: {
    onTextChange: ({ plugin, text }) => {
      const exactTone: 'warm' = plugin.options.tone;
      const nextText: string = text;

      void exactTone;
      void nextText;
    },
  },
  inject: {
    nodeProps: {
      transformProps: ({ plugin, props }) => {
        const exactTone: 'warm' = plugin.options.tone;

        void exactTone;

        return props;
      },
    },
  },
  key: 'contextualInput',
  options: {
    tone: 'warm' as const,
  },
});

const InlineHistoryPlugin = createBasePlugin({
  key: 'inlineHistory',
}).extendExtension(history());

const basePlateEditor = createBaseEditor({
  plugins: [BoldPlugin, ConfiguredCalloutPlugin, FactoryExtensionPlugin],
});
declare const parserOptions: ParserOptions;
const queryBoldInsertData = prepareInsertDataQuery(basePlateEditor, BoldPlugin);

basePlateEditor.read((state) => queryBoldInsertData(state, parserOptions));

const inlineHistoryEditor = createBaseEditor({
  plugins: [InlineHistoryPlugin],
});

const coreHistoryEditor = createBaseEditor({
  plugins: [HistoryPlugin],
});

const OriginalOverridePlugin = createBasePlugin({
  key: 'originalOverride',
})
  .extendEditorApi(() => ({
    overrideLabel: () => 'original' as const,
    scopedLabel: () => 'scoped' as const,
  }))
  .extendApi(({ editor }) => {
    const rootLabel: 'original' = editor.api.overrideLabel();

    // @ts-expect-error root editor API arguments stay typed in plugin contexts
    editor.api.overrideLabel('invalid');

    void rootLabel;

    return {
      pluginScopedLabel: () => 'plugin-scoped' as const,
    };
  });

const ReplacementOverridePlugin = createBasePlugin({
  dependencies: [OriginalOverridePlugin],
  key: 'replacementOverride',
}).extendEditorApi(({ editor }) => ({
  overrideLabel: () => `overridden:${editor.api.scopedLabel()}`,
}));

const overrideEditor = createBaseEditor({
  plugins: [OriginalOverridePlugin, ReplacementOverridePlugin],
});

const boldHotkey: string = basePlateEditor.api.toggleBold();
const boldEnabled: true = basePlateEditor
  .plugin(BoldPlugin)
  .getOptions().enabled;
const calloutVariant: 'info' | 'warning' = basePlateEditor
  .plugin(ConfiguredCalloutPlugin)
  .getOptions().variant;
const calloutDismissible: boolean | undefined = basePlateEditor
  .plugin(ConfiguredCalloutPlugin)
  .getOptions().dismissible;
const calloutPluginVariant: 'info' | 'warning' =
  basePlateEditor.api.callout.getVariant();
const overrideLabel: string = overrideEditor.api.overrideLabel();
const scopedLabel: 'scoped' = overrideEditor.api.scopedLabel();
const portalPluginScopedLabel: 'plugin-scoped' = getEditorPlugin(
  overrideEditor,
  OriginalOverridePlugin
).api.pluginScopedLabel();
const rootPluginScopedLabel: 'plugin-scoped' =
  overrideEditor.api.originalOverride.pluginScopedLabel();
type OverrideEditorApiKeys = keyof typeof overrideEditor.api;
const originalOverrideApiKey: Extract<
  OverrideEditorApiKeys,
  'originalOverride'
> = 'originalOverride';
// @ts-expect-error descriptors do not expose an installed plugin portal
OriginalOverridePlugin.api.pluginScopedLabel();
// @ts-expect-error plugin-scoped API does not leak into editor.api
overrideEditor.api.pluginScopedLabel();

declare const extendedFullConfigApi: ExtendedFullConfig['api'];
declare const extendedFullConfigOptions: ExtendedFullConfig['options'];
declare const extendedFullConfigSelectors: ExtendedFullConfig['selectors'];
declare const extendedFullConfigState: NonNullable<ExtendedFullConfig['state']>;
declare const extendedFullConfigTx: ExtendedFullConfig['tx'];

const extendedFullBaseOption: true = extendedFullConfigOptions.baseOption;
const extendedFullExtraOption: 1 = extendedFullConfigOptions.extraOption;
const extendedFullBaseApi: 'base' = extendedFullConfigApi.baseApi();
const extendedFullExtraApi: 2 = extendedFullConfigApi.extraApi();
const extendedFullBaseSelector: boolean =
  extendedFullConfigSelectors.baseSelector();
const extendedFullExtraSelector: 3 =
  extendedFullConfigSelectors.extraSelector();
const extendedFullBaseState: 'base' = extendedFullConfigState.baseState;
const extendedFullExtraState: 4 = extendedFullConfigState.extraState;

extendedFullConfigTx.extendConfig.baseTx();
extendedFullConfigTx.extendConfig.extraTx('tx');

basePlateEditor.api.setVariant('info');
basePlateEditor.api.setVariant('warning');
inlineHistoryEditor.update((tx) => tx.history.undo());
inlineHistoryEditor.update({ history: 'skip' }, () => {});
coreHistoryEditor.update((tx) => tx.history.redo());
coreHistoryEditor.update({ history: 'merge' }, () => {});

void boldEnabled;
void boldHotkey;
void calloutDismissible;
void calloutPluginVariant;
void calloutVariant;
void originalOverrideApiKey;
void overrideLabel;
void portalPluginScopedLabel;
void rootPluginScopedLabel;
void scopedLabel;
void extendedFullBaseApi;
void extendedFullBaseOption;
void extendedFullBaseSelector;
void extendedFullBaseState;
void extendedFullExtraApi;
void extendedFullExtraOption;
void extendedFullExtraSelector;
void extendedFullExtraState;

// @ts-expect-error invalid configured option value
CalloutPlugin.configure({ options: { variant: 'danger' } });

// @ts-expect-error invalid merged editor api
basePlateEditor.api.notReal();

// @ts-expect-error wrong argument type for merged api
basePlateEditor.api.setVariant('danger');

// @ts-expect-error boolean option must stay boolean
basePlateEditor.plugin(BoldPlugin).getOptions().enabled = 'yes';

// @ts-expect-error editor-level override APIs must not keep stale first-plugin literals
const staleOverrideLabel: 'original' = overrideEditor.api.overrideLabel();
void staleOverrideLabel;

const originalOverridePortalApi = getEditorPlugin(
  overrideEditor,
  OriginalOverridePlugin
).api;
// @ts-expect-error plugin portal API is scoped, not wrapped by plugin key
originalOverridePortalApi.originalOverride.pluginScopedLabel();

// @ts-expect-error selector extension must not land in the tx slot
extendedFullConfigTx.extendConfig.extraSelector();

// @ts-expect-error tx extension must not land in the selector slot
extendedFullConfigSelectors.extraTx('tx');
