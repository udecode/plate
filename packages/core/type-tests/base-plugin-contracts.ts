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
}).extendEditorApi(({ plugin }) => ({
  setVariant: (variant) => {
    plugin.options.variant = variant;
  },
}));

const ConfiguredCalloutPlugin = CalloutPlugin.configure({
  options: {
    variant: 'warning',
  },
})
  .extend({
    options: {
      dismissible: true,
    },
  })
  .extendExtension(baseArrayExtension);

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
  key: 'replacementOverride',
}).extendEditorApi(({ editor }) => {
  const originalApi = getEditorPlugin(editor, OriginalOverridePlugin).api;

  return {
    overrideLabel: () => `overridden:${originalApi.scopedLabel()}`,
  };
});

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
const overrideLabel: string = overrideEditor.api.overrideLabel();
const scopedLabel: 'scoped' = getEditorPlugin(
  overrideEditor,
  OriginalOverridePlugin
).api.scopedLabel();
const portalPluginScopedLabel: 'plugin-scoped' = getEditorPlugin(
  overrideEditor,
  OriginalOverridePlugin
).api.pluginScopedLabel();
const portalRootPluginScopedLabel: 'plugin-scoped' =
  overrideEditor.api.originalOverride.pluginScopedLabel();
const pluginScopedLabel: 'plugin-scoped' =
  overrideEditor.api.originalOverride.pluginScopedLabel();

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
void calloutVariant;
void overrideLabel;
void portalPluginScopedLabel;
void portalRootPluginScopedLabel;
void pluginScopedLabel;
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
