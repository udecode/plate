/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../create-editor';
import { withHistory } from './with-history';

jsxt;

const createHistoryEditor = (value: any): any =>
  withHistory(createEditor(value));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('withHistory upstream parity', () => {
  it('keeps an earlier batch when a selection change precedes the next edit', async () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertText('a');
    await flush();
    editor.select({ path: [0, 0], offset: 0 });
    editor.insertText('b');
    editor.undo();

    expect(editor.children).toEqual([
      { children: [{ text: 'onea' }], type: 'p' },
    ]);
  });

  it('restores the saving flag when the callback throws', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    expect(() =>
      editor.tf.withoutSaving(() => {
        throw new Error('boom');
      })
    ).toThrow('boom');
    editor.insertText('x');

    expect(editor.history.undos).toHaveLength(1);
  });

  it('restores the merging flag when the callback throws', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    expect(() =>
      editor.tf.withoutMerging(() => {
        throw new Error('boom');
      })
    ).toThrow('boom');

    expect(editor.api.isMerging()).toBeUndefined();
  });

  it('keeps the enclosing split after a nested withNewBatch', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertText('a');
    editor.tf.withNewBatch(() => {
      editor.tf.withNewBatch(() => {});
      editor.insertText('b');
    });

    expect(editor.history.undos).toHaveLength(2);
  });
});
