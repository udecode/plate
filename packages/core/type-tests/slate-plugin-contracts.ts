import { createEditor } from '@platejs/slate';

import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  withSlate,
} from '@platejs/core';

const BoldPlugin = createSlatePlugin({
  key: 'bold',
  options: {
    enabled: true as const,
    hotkey: 'mod+b',
  },
}).extendEditorApi(({ getOptions }) => ({
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

const CalloutPlugin = createTSlatePlugin<CalloutConfig>({
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
}).extend({
  options: {
    dismissible: true,
  },
});

const slateEditor = withSlate(createEditor(), {
  plugins: [BoldPlugin, ConfiguredCalloutPlugin],
});

const boldHotkey: string = slateEditor.api.toggleBold();
const boldEnabled: true = slateEditor.getOptions(BoldPlugin).enabled;
const calloutVariant: 'info' | 'warning' = slateEditor.getOptions(
  ConfiguredCalloutPlugin
).variant;
const calloutDismissible: boolean | undefined = slateEditor.getOptions(
  ConfiguredCalloutPlugin
).dismissible;

slateEditor.api.setVariant('info');
slateEditor.api.setVariant('warning');

void boldEnabled;
void boldHotkey;
void calloutDismissible;
void calloutVariant;

// @ts-expect-error invalid configured option value
CalloutPlugin.configure({ options: { variant: 'danger' } });

// @ts-expect-error invalid merged editor api
slateEditor.api.notReal();

// @ts-expect-error wrong argument type for merged api
slateEditor.api.setVariant('danger');

// @ts-expect-error boolean option must stay boolean
slateEditor.getOptions(BoldPlugin).enabled = 'yes';
