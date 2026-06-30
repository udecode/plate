import {
  HistoryPlugin,
  type PluginConfig,
  createBaseEditor,
  createBasePlugin,
  getEditorPlugin,
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
  .extendApi(() => ({
    pluginScopedLabel: () => 'plugin-scoped' as const,
  }));

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
const boldEnabled: true = basePlateEditor.getOptions(BoldPlugin).enabled;
const calloutVariant: 'info' | 'warning' = basePlateEditor.getOptions(
  ConfiguredCalloutPlugin
).variant;
const calloutDismissible: boolean | undefined = basePlateEditor.getOptions(
  ConfiguredCalloutPlugin
).dismissible;
const inlineHistorySaving: boolean | undefined =
  inlineHistoryEditor.api.history.isSaving();
const coreHistorySaving: boolean | undefined =
  coreHistoryEditor.api.history.isSaving();
const overrideLabel: string = overrideEditor.api.overrideLabel();
const scopedLabel: 'scoped' = getEditorPlugin(
  overrideEditor,
  OriginalOverridePlugin
).api.scopedLabel();
const pluginScopedLabel: 'plugin-scoped' =
  overrideEditor.api.originalOverride.pluginScopedLabel();

basePlateEditor.api.setVariant('info');
basePlateEditor.api.setVariant('warning');
inlineHistoryEditor.update((tx) => tx.history.undo());
coreHistoryEditor.update((tx) => tx.history.redo());

void boldEnabled;
void boldHotkey;
void calloutDismissible;
void calloutVariant;
void coreHistorySaving;
void inlineHistorySaving;
void overrideLabel;
void pluginScopedLabel;
void scopedLabel;

// @ts-expect-error invalid configured option value
CalloutPlugin.configure({ options: { variant: 'danger' } });

// @ts-expect-error invalid merged editor api
basePlateEditor.api.notReal();

// @ts-expect-error wrong argument type for merged api
basePlateEditor.api.setVariant('danger');

// @ts-expect-error boolean option must stay boolean
basePlateEditor.getOptions(BoldPlugin).enabled = 'yes';

// @ts-expect-error editor-level override APIs must not keep stale first-plugin literals
const staleOverrideLabel: 'original' = overrideEditor.api.overrideLabel();
void staleOverrideLabel;
