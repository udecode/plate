import { render } from '@testing-library/react';
import type { Value } from 'platejs';
import {
  createEditor,
  definePlatePlugin,
  useCreateEditor,
} from 'platejs/react';
import React from 'react';

describe('useCreateEditor Plate runtime route', () => {
  it('exposes inferred plugin tx groups from public app imports', () => {
    const value: Value = [
      { children: [{ text: 'runtime' }], type: 'paragraph' },
    ];
    const nextValue: Value = [
      { children: [{ text: 'runtime hook' }], type: 'paragraph' },
    ];
    const TxPlugin = definePlatePlugin('txPlugin', {
      update: ({ tx }) => ({
        replace: () => tx.value.replace({ children: nextValue }),
      }),
    });
    let replace: () => void = () => {
      throw new Error('runtime editor was not captured');
    };
    let readRoot: () => ReadonlyArray<Value[number]> = () => {
      throw new Error('runtime editor was not captured');
    };

    const Probe = () => {
      const editor = useCreateEditor({
        plugins: [TxPlugin],
        initialValue: value,
      });
      const assertTxInference = () => {
        editor.update((tx) => {
          tx.txPlugin.replace();
          // @ts-expect-error plugin tx groups should not degrade to any
          tx.txPlugin.missing();
        });
      };

      expect(assertTxInference).toBeInstanceOf(Function);

      replace = () => {
        editor.update.txPlugin.replace();
      };
      readRoot = () => editor.read.value().children;

      return null;
    };

    render(<Probe />);
    replace();

    expect(readRoot()).toEqual(nextValue);
  });

  it('exposes inferred plugin tx groups from public factory imports', () => {
    const value: Value = [
      { children: [{ text: 'runtime' }], type: 'paragraph' },
    ];
    const nextValue: Value = [
      { children: [{ text: 'runtime factory' }], type: 'paragraph' },
    ];
    const TxPlugin = definePlatePlugin('txPlugin', {
      update: ({ tx }) => ({
        replace: () => tx.value.replace({ children: nextValue }),
      }),
    });

    const editor = createEditor({
      plugins: [TxPlugin],
      initialValue: value,
    });
    const assertTxInference = () => {
      editor.update((tx) => {
        tx.txPlugin.replace();
        // @ts-expect-error plugin tx groups should not degrade to any
        tx.txPlugin.missing();
      });
    };

    expect(assertTxInference).toBeInstanceOf(Function);

    editor.update.txPlugin.replace();

    expect(editor.read.value().children).toEqual(nextValue);
  });
});
