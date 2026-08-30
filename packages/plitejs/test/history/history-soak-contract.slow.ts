import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant, type Editor, TextApi } from 'plitejs';

import { history } from '../../src/history';
import { replace as editorReplace } from '../../src/internal';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const createSeededRandom = (initialSeed: number) => {
  let seed = initialSeed >>> 0;

  return () => {
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;

    return seed / 0x1_00_00_00_00;
  };
};

const assertEditorIntegrity = (editor: Editor) => {
  const value = editor.read.value();

  editor.read.schema.assertDocument(value);

  const selection = editor.read.selection();

  if (selection) {
    for (const point of [selection.anchor, selection.focus]) {
      const entry = editor.read.nodes.get(point.path);

      assert.ok(entry, `Missing selection path [${point.path}].`);
      assert.ok(
        TextApi.isText(entry[0]),
        `Selection path [${point.path}] is not text.`
      );
      assert.ok(point.offset >= 0 && point.offset <= entry[0].text.length);
    }
  }

  const state = editor.read((current) => current.history());

  for (const batch of [...state.undos, ...state.redos]) {
    assert.ok(
      !batch.change.empty || batch.effects.length > 0,
      'History retained an empty batch.'
    );
  }
};

const undo = (editor: ReturnType<typeof createHistoryEditor>) => {
  editor.update((tx) => tx.history.undo());
};

const redo = (editor: ReturnType<typeof createHistoryEditor>) => {
  editor.update((tx) => tx.history.redo());
};

const createHistoryEditor = () =>
  createEditor({ extensions: [history()] as const });

const assertUndoRedoRoundTrip = (
  editor: ReturnType<typeof createHistoryEditor>,
  trace: string[]
) => {
  const before = structuredClone(editor.read.value());
  let undoCount = 0;

  while (editor.read((state) => state.history.undos()).length > 0) {
    trace.push(`round-trip:undo:${undoCount}`);
    undo(editor);
    assertEditorIntegrity(editor);
    undoCount += 1;
  }

  for (let index = 0; index < undoCount; index++) {
    trace.push(`round-trip:redo:${index}`);
    redo(editor);
    assertEditorIntegrity(editor);
  }

  assert.deepEqual(editor.read.value(), before);
};

describe('plite-history seeded soak contract', () => {
  it('queues remote bursts without eagerly walking deep history', () => {
    const editor = createEditor({
      extensions: [history({ maxDepth: 1000 })],
      initialValue: [paragraph('body')],
    });

    for (let index = 0; index < 1000; index++) {
      editor.update((tx) => {
        tx.history.newBatch();
        tx.text.insert('l', { at: { offset: 4 + index, path: [0, 0] } });
      });
    }

    for (let index = 0; index < 1000; index++) {
      editor.update({ history: 'skip' }, (tx) => {
        tx.text.insert('r', { at: { offset: 0, path: [0, 0] } });
      });
    }

    editor.update((tx) => tx.history.undo());

    assert.equal(
      editor.read.text.string([]),
      `${'r'.repeat(1000)}body${'l'.repeat(999)}`
    );
  });

  it(
    'preserves tree, selection, and stack invariants across mixed events',
    {
      timeout: 30_000,
    },
    () => {
      const seeds = [
        0x14_01_57_0a, 0x14_02_57_0a, 0x14_03_57_0a, 0x14_04_57_0a,
        0x14_05_57_0a, 0x14_06_57_0a, 0x14_07_57_0a, 0x14_08_57_0a,
      ];

      for (const seed of seeds) {
        const random = createSeededRandom(seed);
        const editor = createHistoryEditor();
        const trace: string[] = [];

        editorReplace(editor, {
          children: Array.from({ length: 4 }, (_, index) =>
            paragraph(`seed-${seed}-block-${index}`)
          ),
          selection: 'start',
        });

        try {
          for (let step = 0; step < 240; step++) {
            const value = editor.read.value();
            const blockIndex = Math.floor(random() * value.children.length);
            const { text } = value.children[blockIndex].children[0] as {
              text: string;
            };
            const event = Math.floor(random() * 10);

            if (event <= 5) {
              const historyMode = event === 5 ? 'skip' : 'new-batch';
              const edit = Math.floor(random() * 5);

              editor.update({ history: historyMode }, (tx) => {
                if (edit === 0 || (edit === 1 && text.length === 0)) {
                  const offset = Math.floor(random() * (text.length + 1));
                  const inserted = String.fromCharCode(
                    97 + Math.floor(random() * 26)
                  );

                  tx.text.insert(inserted, {
                    at: { offset, path: [blockIndex, 0] },
                  });
                  trace.push(
                    `${step}:${historyMode}:insert-text:${blockIndex}:${offset}:${inserted}`
                  );
                  return;
                }

                if (edit === 1) {
                  const offset = Math.floor(random() * text.length);

                  tx.text.delete({
                    at: {
                      kind: 'text',
                      anchor: { offset, path: [blockIndex, 0] },
                      focus: { offset: offset + 1, path: [blockIndex, 0] },
                    },
                  });
                  trace.push(
                    `${step}:${historyMode}:delete-text:${blockIndex}:${offset}`
                  );
                  return;
                }

                if (edit === 2) {
                  const rank = Math.floor(random() * 1000);

                  tx.nodes.set({ rank }, { at: [blockIndex] });
                  trace.push(
                    `${step}:${historyMode}:set-node:${blockIndex}:${rank}`
                  );
                  return;
                }

                if (edit === 3 || value.children.length === 1) {
                  const at = Math.floor(random() * (value.children.length + 1));

                  tx.nodes.insert(paragraph(`inserted-${seed}-${step}`), {
                    at: [at],
                  });
                  trace.push(`${step}:${historyMode}:insert-node:${at}`);
                  return;
                }

                tx.nodes.remove({ at: [blockIndex] });
                trace.push(`${step}:${historyMode}:remove-node:${blockIndex}`);
              });
            } else if (event === 6) {
              trace.push(`${step}:undo`);
              undo(editor);
            } else if (event === 7) {
              trace.push(`${step}:redo`);
              redo(editor);
            } else {
              const offset = Math.floor(random() * (text.length + 1));

              trace.push(`${step}:selection:${blockIndex}:${offset}`);
              editor.update((tx) => {
                tx.selection.set({
                  anchor: { offset, path: [blockIndex, 0] },
                  focus: { offset, path: [blockIndex, 0] },
                });
              });
            }

            assertEditorIntegrity(editor);

            if ((step + 1) % 40 === 0) {
              trace.push(`${step}:round-trip`);
              assertUndoRedoRoundTrip(editor, trace);
            }
          }

          assertUndoRedoRoundTrip(editor, trace);
        } catch (error) {
          throw new Error(
            `History soak failed for seed ${seed}. Trace: ${trace.slice(-40).join(' | ')}`,
            { cause: error }
          );
        }
      }
    }
  );
});
