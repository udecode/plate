import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import { createPlateEditor, toPlatePlugin } from '@platejs/core/react';
import { defineExtension } from '@platejs/plite';

const RuntimeExtensionPlugin = defineBasePlugin('runtimeExtension', {
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
    second: () => `${tx.runtimeExtension.first()}:second` as const,
  }),
}));

const editor = createBaseEditor({
  plugins: [RuntimeExtensionPlugin],
});

const firstApi: 'first' = editor.api.runtimeExtension.first();
const secondApi: 'first:second' = editor.api.runtimeExtension.second();

void firstApi;
void secondApi;

editor.update((tx) => {
  const firstTx: 'first-update' = tx.runtimeExtension.first();
  const secondTx: 'first-update:second' = tx.runtimeExtension.second();

  void firstTx;
  void secondTx;

  // @ts-expect-error unknown tx group should not be inferred
  tx.runtimeExtension.missing();
});

// @ts-expect-error unknown API method should not be inferred
editor.api.runtimeExtension.missing();

const RuntimeStatePlugin = toPlatePlugin(
  defineBasePlugin('runtimeState', {
    api: () => ({
      ping: () => 'runtime-state-ping' as const,
    }),
    initialState: {
      value: 'runtime-state' as const,
    },
  })
);

const plateEditor = createPlateEditor({
  plugins: [RuntimeStatePlugin],
});

const runtimeStateValue: 'runtime-state' = plateEditor
  .plugin(RuntimeStatePlugin)
  .store.get().value;
const runtimeStatePing: 'runtime-state-ping' =
  plateEditor.api.runtimeState.ping();

void runtimeStateValue;
void runtimeStatePing;

const RawBaseCallbackExtension = defineExtension('rawBaseCallback', {
  api: () => ({
    rawBase: () => 'raw-base' as const,
  }),
  enabled: true,
});
const RawBaseCallbackPlugin = defineBasePlugin('rawBaseCallback', {})
  .extend(() => RawBaseCallbackExtension)
  .extend(({ api }) => ({
    api: () => ({
      afterRaw: () => `${api.rawBase()}:after` as const,
    }),
  }));
const rawBaseCallbackEditor = createBaseEditor({
  plugins: [RawBaseCallbackPlugin],
});
const rawBaseCallbackResult: 'raw-base' =
  rawBaseCallbackEditor.api.rawBaseCallback.rawBase();
const rawBaseAfterResult: 'raw-base:after' =
  rawBaseCallbackEditor.api.rawBaseCallback.afterRaw();
// @ts-expect-error raw Base adoption followed by a normal stage stays exact.
rawBaseCallbackEditor.api.rawBaseCallback.missing();

const RawPlateCallbackExtension = defineExtension('rawPlateCallback', {
  api: () => ({
    rawPlate: () => 'raw-plate' as const,
  }),
  enabled: true,
});
const RawPlateCallbackPlugin = toPlatePlugin(
  defineBasePlugin('rawPlateCallback', {})
)
  .extend(() => RawPlateCallbackExtension)
  .extend(({ api }) => ({
    api: () => ({
      afterRaw: () => `${api.rawPlate()}:after` as const,
    }),
  }));
const rawPlateCallbackEditor = createPlateEditor({
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
