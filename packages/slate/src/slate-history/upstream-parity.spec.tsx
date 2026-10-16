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

  it('keeps normalization in the same undo step inside withoutMerging', () => {
    const editor = withHistory(
      createEditor({
        children: [{ children: [{ text: 'a' }], type: 'p' }],
      }) as any
    ) as any;
    editor.isInline = (element: any) => element.inline === true;
    const point = { offset: 0, path: [0, 0] };

    editor.tf.withoutMerging(() => {
      editor.tf.wrapNodes(
        { children: [], inline: true },
        { at: { anchor: point, focus: point }, split: true, voids: true }
      );
    });

    expect(editor.history.undos).toHaveLength(1);

    while (editor.history.undos.length > 0) {
      editor.undo();
    }

    expect(editor.children).toEqual([{ children: [{ text: 'a' }], type: 'p' }]);
  });

  it('restores a valid selection when undoing a merge into a void inside withoutMerging', () => {
    const value = [
      { children: [{ text: 'a' }], type: 'p' },
      { children: [{ text: '' }], type: 'void', void: true },
    ];
    const editor = withHistory(
      createEditor({ children: structuredClone(value) }) as any
    ) as any;
    editor.isVoid = (element: any) => element.void === true;
    const selection = {
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [0, 0] },
    };
    editor.selection = selection;

    editor.tf.withoutMerging(() => {
      editor.tf.delete({
        at: { offset: 0, path: [1, 0] },
        distance: 1,
        reverse: true,
        unit: 'character',
        voids: true,
      });
    });

    while (editor.history.undos.length > 0) {
      editor.undo();
    }

    expect(editor.children).toEqual(value);
    expect(editor.selection).toEqual(selection);
  });
});
