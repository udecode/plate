import { createEditor as createHeadlessEditor, definePlugin } from 'platejs';
import { history } from 'platejs/history';
import { createEditor, toReactPlugin, useCreateEditor } from 'platejs/react';

import { defineRuntimePlugin } from '../src/facade';

const StagedPlugin = definePlugin('runtimePlugin', {
  api: () => ({
    first: () => 'first' as const,
  }),
  update: () => ({
    first: () => 'first-update' as const,
  }),
}).extend(({ api }) => ({
  api: () => ({
    second: () => `${api.first()}:second` as const,
  }),
  update: ({ tx }) => ({
    second: () => `${tx.runtimePlugin.first()}:second` as const,
  }),
}));

const editor = createHeadlessEditor({
  plugins: [StagedPlugin],
});

const firstApi: 'first' = editor.api.runtimePlugin.first();
const secondApi: 'first:second' = editor.api.runtimePlugin.second();

void firstApi;
void secondApi;

editor.update((tx) => {
  const firstTx: 'first-update' = tx.runtimePlugin.first();
  const secondTx: 'first-update:second' = tx.runtimePlugin.second();

  void firstTx;
  void secondTx;

  // @ts-expect-error unknown tx group should not be inferred
  tx.runtimePlugin.missing();
});

// @ts-expect-error unknown API method should not be inferred
editor.api.runtimePlugin.missing();

const RuntimeStatePlugin = toReactPlugin(
  definePlugin('runtimeState', {
    api: () => ({
      ping: () => 'runtime-state-ping' as const,
    }),
    initialState: {
      value: 'runtime-state' as const,
    },
  })
);

const plateEditor = createEditor({
  plugins: [RuntimeStatePlugin],
});

const runtimeStateValue: 'runtime-state' = plateEditor
  .plugin(RuntimeStatePlugin)
  .store.get().value;
const runtimeStatePing: 'runtime-state-ping' =
  plateEditor.api.runtimeState.ping();

void runtimeStateValue;
void runtimeStatePing;

const HistoryPlugin = history();
const SiblingPlugin = defineRuntimePlugin('historySibling', {});
const lowLevelPluginEditor = createEditor({
  plugins: [HistoryPlugin, SiblingPlugin],
});
const lowLevelHistoryPortal = lowLevelPluginEditor.plugin(HistoryPlugin);

lowLevelHistoryPortal.read.undos();
lowLevelHistoryPortal.update.undo();

const useLowLevelPluginEditor = () => {
  const hookEditor = useCreateEditor({
    plugins: [HistoryPlugin, SiblingPlugin],
  });
  const hookHistoryPortal = hookEditor.plugin(HistoryPlugin);

  hookHistoryPortal.read.redos();
  hookHistoryPortal.update.redo();
};

const RawBaseCapabilityPlugin = defineRuntimePlugin('rawBaseCallback', {
  api: () => ({
    rawBase: () => 'raw-base' as const,
  }),
  enabled: true,
});
const RawBaseCallbackPlugin = definePlugin('rawBaseCallback', {})
  .extend(() => RawBaseCapabilityPlugin)
  .extend(({ api }) => ({
    api: () => ({
      afterRaw: () => `${api.rawBase()}:after` as const,
    }),
  }));
const rawBaseCallbackEditor = createHeadlessEditor({
  plugins: [RawBaseCallbackPlugin],
});
const rawBaseCallbackResult: 'raw-base' =
  rawBaseCallbackEditor.api.rawBaseCallback.rawBase();
const rawBaseAfterResult: 'raw-base:after' =
  rawBaseCallbackEditor.api.rawBaseCallback.afterRaw();
// @ts-expect-error raw Base adoption followed by a normal stage stays exact.
rawBaseCallbackEditor.api.rawBaseCallback.missing();

const RawPlateCapabilityPlugin = defineRuntimePlugin('rawPlateCallback', {
  api: () => ({
    rawPlate: () => 'raw-plate' as const,
  }),
  enabled: true,
});
const RawPlateCallbackPlugin = toReactPlugin(
  definePlugin('rawPlateCallback', {})
)
  .extend(() => RawPlateCapabilityPlugin)
  .extend(({ api }) => ({
    api: () => ({
      afterRaw: () => `${api.rawPlate()}:after` as const,
    }),
  }));
const rawPlateCallbackEditor = createEditor({
  plugins: [RawPlateCallbackPlugin],
});
const rawPlateCallbackResult: 'raw-plate' =
  rawPlateCallbackEditor.api.rawPlateCallback.rawPlate();
const rawPlateAfterResult: 'raw-plate:after' =
  rawPlateCallbackEditor.api.rawPlateCallback.afterRaw();
// @ts-expect-error raw Plate adoption followed by a normal stage stays exact.
rawPlateCallbackEditor.api.rawPlateCallback.missing();

void rawBaseCallbackResult;
void rawBaseAfterResult;
void rawPlateCallbackResult;
void rawPlateAfterResult;
void useLowLevelPluginEditor;

const CapabilityCompatibilityPlugin = definePlugin('capabilityCompatibility', {
  api: () => ({
    parse: (value: string) => value.length,
  }),
  initialState: {
    mode: 'ready',
  },
  read: () => ({
    status: () => 'ready',
  }),
  selectors: {
    isReady: ({ mode }) => mode === 'ready',
  },
  update: () => ({
    replace: (value: string) => value.length,
  }),
});

CapabilityCompatibilityPlugin.extend({
  api: () => ({
    format: (value: number) => String(value),
    parse: (value: unknown) => String(value).length,
  }),
  initialState: {
    count: 0,
    mode: 'busy' as const,
  },
  read: () => ({
    status: () => 'ready' as const,
    version: () => 1 as const,
  }),
  selectors: {
    isReady: ({ mode }) => mode === 'ready',
  },
  update: () => ({
    clear: () => true,
    replace: (value: unknown) => String(value).length,
  }),
});

CapabilityCompatibilityPlugin.extend({
  // @ts-expect-error API overrides cannot narrow inherited parameters.
  api: () => ({ parse: (value: 'only') => value.length }),
});
CapabilityCompatibilityPlugin.extend({
  // @ts-expect-error API overrides must preserve inherited result types.
  api: () => ({ parse: () => 'invalid' }),
});
CapabilityCompatibilityPlugin.extend({
  // @ts-expect-error Read overrides must preserve inherited result types.
  read: () => ({ status: () => 1 }),
});
CapabilityCompatibilityPlugin.extend({
  // @ts-expect-error Update overrides cannot narrow inherited parameters.
  update: () => ({ replace: (value: 'only') => value.length }),
});
// @ts-expect-error State overrides must remain assignable to inherited fields.
CapabilityCompatibilityPlugin.extend({ initialState: { mode: 1 } });
CapabilityCompatibilityPlugin.extend({
  // @ts-expect-error Selector overrides must preserve inherited result types.
  selectors: { isReady: () => 'invalid' },
});

const IncompatibleRawCapabilityPlugin = defineRuntimePlugin(
  'capabilityCompatibility',
  {
    api: () => ({ parse: (value: 'only') => value.length }),
  }
);
// @ts-expect-error Raw plugin adoption follows the same capability law.
CapabilityCompatibilityPlugin.extend(IncompatibleRawCapabilityPlugin);

const PlateCapabilityCompatibilityPlugin = toReactPlugin(
  CapabilityCompatibilityPlugin
);
PlateCapabilityCompatibilityPlugin.extend({
  api: () => ({ plateOnly: () => true }),
});
PlateCapabilityCompatibilityPlugin.extend({
  // @ts-expect-error Base-to-React adaptation preserves API compatibility.
  api: () => ({ parse: (value: 'only') => value.length }),
});
