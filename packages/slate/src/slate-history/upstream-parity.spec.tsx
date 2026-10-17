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

describe('withHistory setChildren parity', () => {
  const p = (text: string) => ({ children: [{ text }], type: 'p' });
  const strings = (editor: any) =>
    editor.children.map((node: any) => node.children[0].text);

  it('records setChildren as its own undo step', () => {
    const editor = createHistoryEditor({ children: [p('a')] });

    editor.tf.select({ offset: 1, path: [0, 0] });
    editor.tf.insertText('b');
    editor.tf.setChildren([p('abc')]);
    editor.tf.insertText('d');

    expect(editor.history.undos).toHaveLength(3);

    editor.undo();

    expect(strings(editor)).toEqual(['abc']);

    editor.undo();

    expect(strings(editor)).toEqual(['ab']);
  });

  it('keeps the caret in its block when fresh JSON adds a block at the top', () => {
    const editor = createHistoryEditor({
      children: [p('one'), p('two'), p('three')],
    });

    editor.tf.select({ offset: 2, path: [2, 0] });
    editor.tf.setChildren(
      JSON.parse(JSON.stringify([p('zero'), ...editor.children]))
    );

    expect(strings(editor)).toEqual(['zero', 'one', 'two', 'three']);
    expect(editor.selection.anchor).toEqual({ offset: 2, path: [3, 0] });
  });
});

describe('withHistory unsaved changes parity', () => {
  const p = (text: string) => ({ children: [{ text }], type: 'p' });
  const strings = (editor: any) =>
    editor.children.map((node: any) =>
      node.children.map((child: any) => child.text).join('')
    );
  const remote = (editor: any, fn: () => void) => {
    editor.tf.withNewBatch(() => {});
    editor.tf.withoutSaving(fn);
  };

  it('reverts typing after a block is inserted above it', () => {
    const editor = createHistoryEditor({ children: [p('typed: ')] });

    editor.tf.select({ offset: 7, path: [0, 0] });
    editor.tf.insertText('abc');
    remote(editor, () => editor.tf.insertNodes(p('streamed'), { at: [0] }));
    editor.undo();

    expect(strings(editor)).toEqual(['streamed', 'typed: ']);
  });

  it('keeps text inserted inside the typed text', () => {
    const editor = createHistoryEditor({ children: [p('hello')] });

    editor.tf.select({ offset: 5, path: [0, 0] });
    editor.tf.insertText('abc');
    remote(editor, () =>
      editor.tf.insertText('Z', { at: { offset: 6, path: [0, 0] } })
    );
    editor.undo();

    expect(strings(editor)).toEqual(['helloZ']);
  });

  it('redoes in the right block after an insert above it', () => {
    const editor = createHistoryEditor({ children: [p('a')] });

    editor.tf.select({ offset: 1, path: [0, 0] });
    editor.tf.insertText('bc');
    editor.undo();
    remote(editor, () => editor.tf.insertNodes(p('top'), { at: [0] }));
    editor.redo();

    expect(strings(editor)).toEqual(['top', 'abc']);
  });

  it('removes only local edits across random runs', () => {
    for (let run = 1; run <= 200; run++) {
      let seed = run;
      const pick = (n: number) => {
        seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;

        return Math.floor((seed / 2_147_483_648) * n);
      };
      const editor = createHistoryEditor({
        children: [p('aa'), p('bb'), p('cc')],
      });
      let remoteChars = 0;
      const point = () => {
        const index = pick(editor.children.length);
        const length = strings(editor)[index].length;

        return { offset: pick(length + 1), path: [index, 0] };
      };

      for (let step = 0; step < 16; step++) {
        const kind = pick(4);

        if (kind === 0) {
          editor.tf.withNewBatch(() => {
            editor.tf.select(point());
            editor.tf.insertText('L');
          });
        } else if (kind === 1) {
          editor.tf.withNewBatch(() => {
            editor.tf.select(point());
            editor.tf.insertBreak();
          });
        } else if (kind === 2) {
          remote(editor, () =>
            editor.tf.insertNodes(p('R'), {
              at: [pick(editor.children.length + 1)],
            })
          );
          remoteChars++;
        } else {
          remote(editor, () => editor.tf.insertText('R', { at: point() }));
          remoteChars++;
        }
      }
      while (editor.history.undos.length > 0) editor.undo();

      const text = strings(editor).join('');

      expect(text.includes('L')).toBe(false);
      expect(text.split('R').length - 1).toBe(remoteChars);
    }
  });
});
