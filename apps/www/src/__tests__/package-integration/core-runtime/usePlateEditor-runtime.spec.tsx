import React from 'react';
import { render } from '@testing-library/react';
import type { EditorUpdateTransaction, Value } from 'platejs';
import {
  createPlateEditor,
  createPlatePlugin,
  usePlateEditor,
} from 'platejs/react';

describe('usePlateEditor Plite runtime route', () => {
  it('exposes inferred plugin tx groups from public app imports', () => {
    const value: Value = [{ children: [{ text: 'runtime' }], type: 'p' }];
    const nextValue: Value = [
      { children: [{ text: 'runtime hook' }], type: 'p' },
    ];
    const TxPlugin = createPlatePlugin({ key: 'txPlugin' }).extendTx(() => ({
      txPlugin: (tx: EditorUpdateTransaction<Value>) => ({
        replace: () => tx.value.replace({ children: nextValue }),
      }),
    }));
    let replace: () => void = () => {
      throw new Error('runtime editor was not captured');
    };
    let readRoot: () => readonly Value[number][] = () => {
      throw new Error('runtime editor was not captured');
    };

    const Probe = () => {
      const editor = usePlateEditor({
        plugins: [TxPlugin],
        runtime: 'plite',
        value,
      });
      const assertTxInference = (
        tx: Parameters<Parameters<typeof editor.update>[0]>[0]
      ) => {
        tx.txPlugin.replace();
        // @ts-expect-error plugin tx groups should not degrade to any
        tx.txPlugin.missing();
      };

      expect(assertTxInference).toBeInstanceOf(Function);

      replace = () => {
        editor.update((tx) => {
          tx.txPlugin.replace();
        });
      };
      readRoot = () => editor.read((state) => state.value.root());

      return null;
    };

    render(<Probe />);
    replace();

    expect(readRoot()).toEqual(nextValue);
  });

  it('exposes inferred plugin tx groups from public factory imports', () => {
    const value: Value = [{ children: [{ text: 'runtime' }], type: 'p' }];
    const nextValue: Value = [
      { children: [{ text: 'runtime factory' }], type: 'p' },
    ];
    const TxPlugin = createPlatePlugin({ key: 'txPlugin' }).extendTx(() => ({
      txPlugin: (tx: EditorUpdateTransaction<Value>) => ({
        replace: () => tx.value.replace({ children: nextValue }),
      }),
    }));

    const editor = createPlateEditor({
      plugins: [TxPlugin],
      runtime: 'plite',
      value,
    });
    const assertTxInference = (
      tx: Parameters<Parameters<typeof editor.update>[0]>[0]
    ) => {
      tx.txPlugin.replace();
      // @ts-expect-error plugin tx groups should not degrade to any
      tx.txPlugin.missing();
    };

    expect(assertTxInference).toBeInstanceOf(Function);

    editor.update((tx) => {
      tx.txPlugin.replace();
    });

    expect(editor.read((state) => state.value.root())).toEqual(nextValue);
  });
});
