import { createBaseEditor, createBasePlugin } from '@platejs/core';

const RuntimeExtensionPlugin = createBasePlugin({
  key: 'runtimeExtension',
})
  .extendExtension({
    api: {
      runtimeExtension: {
        first: () => 'first' as const,
      },
    },
    tx: {
      runtimeFirst: () => ({
        run: () => 'first-tx' as const,
      }),
    },
  })
  .extendExtension({
    api: {
      runtimeExtension: {
        second: () => 'second' as const,
      },
    },
    tx: {
      runtimeSecond: () => ({
        run: () => 'second-tx' as const,
      }),
    },
  });

const editor = createBaseEditor({
  plugins: [RuntimeExtensionPlugin],
});

const firstApi: 'first' = editor.api.runtimeExtension.first();
const secondApi: 'second' = editor.api.runtimeExtension.second();

void firstApi;
void secondApi;

editor.update((tx) => {
  const firstTx: 'first-tx' = tx.runtimeFirst.run();
  const secondTx: 'second-tx' = tx.runtimeSecond.run();

  void firstTx;
  void secondTx;

  // @ts-expect-error unknown tx group should not be inferred
  tx.runtimeMissing.run();
});

// @ts-expect-error unknown API method should not be inferred
editor.api.runtimeExtension.missing();
