import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  type Descendant,
  DocumentChange,
  NodeApi,
} from 'plitejs';
import { history } from 'plitejs/history';

import { applyTransactionSpec } from '../src/core/public-state';
import { readCoreWork } from '../src/core/work';
import { MAX_DEFERRED_NODE_KEY_STEPS } from '../src/utils/node-keys';

type KeyReader = {
  key: (target: never) => string | null;
  read: {
    children: () => readonly Descendant[];
    nodes: { path: (nodeKey: never) => unknown };
  };
};

const P = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const Q = (...children: object[]) => ({ type: 'blockquote', children });
const blocks = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => P(`${prefix}${index}`));
const caretAt = (path: number[], offset: number) => ({
  kind: 'text',
  anchor: { path, offset },
  focus: { path, offset },
});

const make = () => {
  const editor = createEditor({
    initialValue: {
      children: [P('One'), P('Two')],
      roots: { header: [P('Head')] },
    },
  });

  return { editor, header: createEditorView(editor, { root: 'header' }) };
};

const tryKey = (reader: Pick<KeyReader, 'key'>, target: unknown) => {
  try {
    return reader.key(target as never);
  } catch (error) {
    return `throws ${String(error)}`;
  }
};

const keyFailures = (readers: Record<string, KeyReader>) => {
  const failures: string[] = [];
  const holders = new Map<unknown, string>();

  for (const [root, reader] of Object.entries(readers)) {
    for (const [node, path] of NodeApi.descendants({
      children: reader.read.children(),
    } as any)) {
      const byPath = tryKey(reader, path);
      const byObject = tryKey(reader, node);
      const where = `${root}[${path}]`;

      if (!byPath || String(byPath).startsWith('throws')) {
        failures.push(`${where} has no key by path: ${byPath}`);
        continue;
      }
      if (byObject !== byPath) {
        failures.push(`${where} is ${byObject} by object, ${byPath} by path`);
      }
      const found = reader.read.nodes.path(byPath as never);

      if (JSON.stringify(found) !== JSON.stringify(path)) {
        failures.push(`${where} key ${byPath} finds ${JSON.stringify(found)}`);
      }
      if (holders.has(byPath)) {
        failures.push(`${where} repeats ${byPath} of ${holders.get(byPath)}`);
      }
      holders.set(byPath, where);
    }
  }

  return failures;
};

const keysOf = (readers: Record<string, KeyReader>) =>
  JSON.stringify(
    Object.entries(readers).map(([root, reader]) => [
      root,
      [...NodeApi.descendants({ children: reader.read.children() } as any)].map(
        ([node, path]) => [tryKey(reader, path), tryKey(reader, node)]
      ),
    ])
  );

const spec = (editor: any, write: (tx: any) => void) =>
  editor.read((state) => state.transaction(write));

const draftReader = (tx: any): KeyReader => ({
  key: (target) => tx.key(target),
  read: { children: () => tx.children(), nodes: tx.nodes },
});

const pasteIntoHeader = (tx: any) => {
  const point = { path: [0, 0], offset: 2, root: 'header' };

  tx.fragment.replace([P('a'), P('b'), P('c')], {
    at: { anchor: point, focus: point },
  });
};

const reinsertFirst = (tx: any) => {
  const [block] = tx.children();

  tx.nodes.remove({ at: [0] });
  tx.nodes.insert(block, { at: [1] });
};

const moveIntoHeaderAndBack = (tx: any) => {
  const [block] = tx.children();

  tx.nodes.remove({ at: [0] });
  tx.nodes.insert(block, { at: { path: [0, 0], offset: 4, root: 'header' } });
  tx.nodes.insert(block, { at: [0] });
};

const armKeysInFreshProcess = (arm: 'control' | 'spec') => {
  const { exitCode, stderr, stdout } = Bun.spawnSync({
    cmd: [
      process.execPath,
      new URL('support/discard-arms.ts', import.meta.url).pathname,
      arm,
    ],
  });

  assert.equal(exitCode, 0, stderr.toString());

  return JSON.parse(stdout.toString());
};

const acceptPaste = (editor: any, count: number, read: number) => {
  let block: unknown;
  let key: unknown;
  const paste = spec(editor, (tx) => {
    tx.selection.set(caretAt([5, 0], 1));
    tx.fragment.replace(blocks('q', count));
    block = tx.children()[read];
    key = tx.key([read]);
  });

  editor.update(() => applyTransactionSpec(editor, paste));

  return { block, key };
};

describe('insert node keys', () => {
  it('leaves every key as it would be without a discarded ambient spec that inserts a block the spec around it pasted', () => {
    assert.deepEqual(
      armKeysInFreshProcess('spec'),
      armKeysInFreshProcess('control')
    );
  });

  it('keeps the key an accepted spec read on a pasted block after a move and a removal elsewhere', () => {
    const editor = createEditor({ initialValue: blocks('m', 20) });
    const { block, key } = acceptPaste(editor, 9, 8);

    editor.update((tx) => tx.nodes.move({ at: [12], to: [0] }));
    editor.update((tx) => tx.nodes.remove({ at: [4] }));
    const at = editor.read.children().indexOf(block as Descendant);
    const found = editor.read.nodes.path(key as never);

    editor.update((tx) => tx.nodes.insert(block, { at: [0] }));

    assert.deepEqual(
      [found, editor.key(block), keyFailures({ main: editor })],
      [[at], key, []]
    );
  });

  it('keeps the key an accepted spec read on a pasted block after a document diff wraps the block before it into a quote', () => {
    const editor = createEditor({ initialValue: blocks('m', 20) });
    const { block, key } = acceptPaste(editor, 9, 8);

    editor.update((tx) => {
      const children = tx.children();

      tx.changes.apply(
        DocumentChange.between(
          { children },
          {
            children: [
              ...children.slice(0, 5),
              { type: 'quote', children: [children[5]] },
              ...children.slice(7),
            ],
          }
        )
      );
    });
    editor.update((tx) => tx.nodes.insert(P('fresh'), { at: [0] }));

    assert.deepEqual(
      [
        editor.read.nodes.path(key as never),
        editor.key([8]),
        editor.key(block as never),
      ],
      [[8], key, key]
    );
  });

  it("gives a block another editor keyed this editor's own key, found by object and by path", () => {
    const a = createEditor({ initialValue: [P('a0'), P('a1')] });
    const b = createEditor({ initialValue: [P('b0')] });
    const aKey = a.key([0]);
    const [node] = a.read.children();
    let found: unknown;

    b.update((tx) => {
      tx.nodes.insert(node, { at: [1] });
      found = tryKey(tx, node) === tx.key([1]);
    });
    a.update((tx) => tx.nodes.move({ at: [0], to: [1] }));

    assert.deepEqual([found, a.key([1])], [true, aKey]);
  });

  it('keeps the key of a block an accepted spec removed and reinserted', () => {
    const { editor } = make();
    const key = editor.key([0]);

    editor.update(() =>
      applyTransactionSpec(editor, spec(editor, reinsertFirst))
    );

    assert.equal(editor.key([1]), key);
  });

  it('keeps the key of a block an update removed and put back inside a fresh quote', () => {
    const { editor } = make();
    const key = editor.key([0]);

    editor.update((tx) => {
      const [block] = tx.children();

      tx.nodes.remove({ at: [0] });
      tx.nodes.insert(Q(block), { at: [1] });
    });

    assert.equal(editor.key([1, 0]), key);
  });

  it('gives text live in the same root its own key when a fresh block around it is inserted', () => {
    const { editor, header } = make();
    const [text] = (editor.read.children()[0] as any).children;
    const key = editor.key([0, 0]);

    editor.update((tx) =>
      tx.nodes.insert({ type: 'paragraph', children: [text] }, { at: [2] })
    );

    assert.deepEqual(
      [editor.key([0, 0]), keyFailures({ header, main: editor })],
      [key, []]
    );
  });

  it('gives a duplicate of a live block its own key when the spec is accepted', () => {
    const { editor, header } = make();
    const key = editor.key([0]);
    const duplicate = spec(editor, (tx) =>
      tx.nodes.insert(tx.children()[0], { at: [2] })
    );

    editor.update(() => applyTransactionSpec(editor, duplicate));

    assert.deepEqual(
      [editor.key([0]), keyFailures({ header, main: editor })],
      [key, []]
    );
  });

  it('gives a fresh literal a prepared key in a spec, and acceptance keeps that key', () => {
    const { editor } = make();
    const fresh = P('fresh');
    let prepared: unknown;
    const insert = spec(editor, (tx) => {
      tx.nodes.insert(fresh, { at: [2] });
      prepared = tx.key(fresh);
    });

    editor.update(() => applyTransactionSpec(editor, insert));

    assert.deepEqual(
      [String(prepared).startsWith('p'), editor.key([2])],
      [true, prepared]
    );
  });

  it('finds a tx.schema.create node a document diff read at its inserted path', () => {
    const { editor } = make();
    let found: unknown;

    editor.update((tx) => {
      const element = tx.schema.create('paragraph', {});
      const children = tx.children();

      DocumentChange.between(
        { children },
        { children: Object.freeze([...children, element]) }
      );
      tx.nodes.insert(element, { at: [2] });
      found = [tx.nodes.get(element)?.[1], tryKey(tx, element) === tx.key([2])];
    });

    assert.deepEqual(found, [[2], true]);
  });

  it('resolves one fresh object inserted twice to its first copy', () => {
    const { editor } = make();
    const fresh = P('fresh');
    let keys: unknown;

    editor.update((tx) => {
      tx.nodes.insert(fresh, { at: [2] });
      tx.nodes.insert(fresh, { at: [3] });
      keys = [tx.key(fresh), tx.key([2])];
    });

    assert.equal((keys as unknown[])[0], (keys as unknown[])[1]);
  });

  it('gives a copy of a block pasted into another root its own key before any read binds it', () => {
    const { editor, header } = make();

    header.update((tx) => {
      tx.selection.set(caretAt([0, 0], 4));
      tx.fragment.replace([P('a'), P('b'), P('c')]);
    });
    const live = header.read.children()[1];

    editor.update((tx) => tx.nodes.insert(live, { at: [2] }));

    assert.deepEqual(keyFailures({ header, main: editor }), []);
  });

  it('gives a block a paste rewrote its own key inside the spec draft that inserts it again', () => {
    const editor = createEditor({
      initialValue: [P('One'), P('Two'), P('Six'), Q(P('Quoted'))],
      plugins: [history()],
    });
    let failures: string[] = [];

    spec(editor, (tx) => {
      tx.selection.set(caretAt([1, 0], 1));
      tx.fragment.replace([P('a'), Q(P('q1'), P('q2')), P('c')]);
      tx.nodes.insert(tx.children()[1], { at: [0] });
      failures = keyFailures({ main: draftReader(tx) });
    });

    assert.deepEqual(failures, []);
  });

  it('gives a block a paste rewrote its own key when a continued spec inserts it again', () => {
    const editor = createEditor({
      initialValue: [P('one'), P('two'), P('three')],
    });
    const pasted = spec(editor, (tx) => {
      tx.selection.set(caretAt([1, 0], 1));
      tx.fragment.replace([P('a'), P('b'), P('c')]);
      tx.selection.set({
        ...caretAt([0, 0], 0),
        focus: { path: [0, 0], offset: 1 },
      });
      tx.fragment.replace([{ text: 'x' }]);
    });
    let failures: string[] = [];

    editor.read((state) =>
      state.transaction.extend(pasted, (tx) => {
        tx.nodes.insert(tx.children()[3], { at: [0] });
        failures = keyFailures({ main: draftReader(tx) });
      })
    );

    assert.deepEqual(failures, []);
  });

  it('gives a block its own key when an update moves it into another root through a rooted point and inserts it again', () => {
    const { editor, header } = make();

    editor.update(moveIntoHeaderAndBack);

    assert.deepEqual(keyFailures({ header, main: editor }), []);
  });

  it('leaves every key as it was when a spec that moved a block into another root and inserted it again is discarded', () => {
    const { editor, header } = make();
    const readers = { header, main: editor };
    const before = keysOf(readers);

    spec(editor, moveIntoHeaderAndBack);

    assert.equal(keysOf(readers), before);
  });

  it('keeps the first of two objects of one removed block when the spec removes the second by object', () => {
    const { editor } = make();
    const [old] = editor.read.children();

    editor.key([0]);
    editor.update((tx) =>
      tx.text.insert('!', { at: { path: [0, 0], offset: 0 } })
    );
    const reinsert = spec(editor, (tx) => {
      const [current] = tx.children();

      tx.nodes.remove({ at: [0] });
      tx.nodes.insert([old, current], { at: [0] });
      tx.nodes.remove({ at: tx.children()[1] });
    });

    editor.update(() => applyTransactionSpec(editor, reinsert));

    assert.deepEqual(
      editor.read.children().map((node: any) => node.children[0].text),
      ['One', 'Two']
    );
  });

  it("gives a copy its own key when a nested spec reads and inserts a root's original block after the outer spec pasted into that root", () => {
    const { editor, header } = make();
    const [original] = header.read.children();
    const headKey = header.key([0]);
    const outer = editor.read((state) =>
      state.transaction((tx) => {
        pasteIntoHeader(tx);
        applyTransactionSpec(
          editor,
          state.transaction((inner) => {
            tryKey(inner, original);
            inner.nodes.insert(original, { at: [2] });
          })
        );
      })
    );

    editor.update(() => applyTransactionSpec(editor, outer));

    assert.deepEqual(
      [header.key([0]), keyFailures({ header, main: editor })],
      [headKey, []]
    );
  });

  it('removes the block a spec finds by object in a document view that reorders another root', () => {
    const editor = createEditor({
      initialValue: {
        children: [P('main')],
        roots: { header: [P('A'), P('B')] },
      },
    });
    const header = createEditorView(editor, { root: 'header' });

    header.key([0]);
    const [a, b] = header.read.children();
    const view = createEditorView(editor, {
      document: Object.freeze({
        children: editor.read.children(),
        roots: Object.freeze({ header: Object.freeze([b, a]) }),
      }),
    });
    let remaining: unknown;

    view.read((state) =>
      state.transaction((tx) => {
        tx.nodes.remove({ at: b });
        remaining = tx.root('header');
      })
    );

    assert.deepEqual(remaining, [a]);
  });

  it('gives copies their own keys when finding one source key keys the rest of its root', () => {
    const { editor, header } = make();

    header.update((tx) => {
      tx.selection.set(caretAt([0, 0], 4));
      tx.fragment.replace([P('a'), P('b'), P('c'), P('d')]);
    });
    const key = header.key([1]);

    header.update((tx) => tx.nodes.insert(P('fresh'), { at: [0] }));
    const [b, c] = header.read.children().slice(2);

    editor.update((tx) => tx.nodes.insert([b, c], { at: [2] }));

    assert.deepEqual(
      [header.key([2]), keyFailures({ header, main: editor })],
      [key, []]
    );
  });
});

describe('insert node keys work', () => {
  const walksOf = (run: () => void) => {
    const before = readCoreWork().snapshotIndexWalks;

    run();

    return readCoreWork().snapshotIndexWalks - before;
  };

  const walksAfterFirstUpdate = (update: (round: number) => void) =>
    [0, 1, 2, 3].map((round) => walksOf(() => update(round))).slice(1);

  it('walks no root to copy into a large root after each paste whose blocks a by-path read keyed', () => {
    const editor = createEditor({
      initialValue: {
        children: blocks('m', 2000),
        roots: { header: blocks('h', 10) },
      },
    });
    const source = createEditorView(editor, {
      root: 'header',
    }).read.children()[3];
    const copy = () => {
      editor.update((tx) => tx.nodes.insert(source, { at: [1000] }));
      editor.update((tx) => tx.nodes.remove({ at: [1000] }));
    };

    copy();

    assert.deepEqual(
      Array.from({ length: 3 }, (_, round) => {
        editor.update((tx) => {
          tx.selection.set(caretAt([1000, 0], 0));
          tx.fragment.replace([P(`a${round}`), P(`b${round}`), P(`c${round}`)]);
        });
        for (let offset = 0; offset < 4; offset++) editor.key([1000 + offset]);

        return walksOf(copy);
      }),
      [0, 0, 0]
    );
  });

  it('walks no root to move a block after an edit to a large other root, after the first update', () => {
    const editor = createEditor({
      initialValue: {
        children: blocks('m', 100),
        roots: { header: blocks('h', 2000) },
      },
    });

    assert.deepEqual(
      walksAfterFirstUpdate((round) =>
        editor.update((tx) => {
          tx.nodes.insert(P(`edit${round}`), {
            at: { path: [1000, 0], offset: 0, root: 'header' },
          });
          reinsertFirst(tx);
        })
      ),
      [0, 0, 0]
    );
  });

  it('walks no root for a spec in a root view built after an update to a large other root, after the first spec', () => {
    const editor = createEditor({
      initialValue: {
        children: blocks('m', 2000),
        roots: { header: blocks('h', 10) },
      },
    });

    editor.update((tx) => tx.nodes.insert(P('edit'), { at: [10] }));
    const view = createEditorView(editor, {
      document: editor.read.value(),
      root: 'header',
    });

    assert.deepEqual(
      walksAfterFirstUpdate(() =>
        spec(view, (tx) => tx.nodes.insert(tx.children()[0], { at: [1] }))
      ),
      [0, 0, 0]
    );
  });

  it('walks no root for a spec that edits a large other root a read has cached and moves a block, after the first spec', () => {
    const editor = createEditor({
      initialValue: {
        children: blocks('m', 100),
        roots: { header: blocks('h', 2000) },
      },
    });

    createEditorView(editor, { root: 'header' }).key([0]);
    assert.deepEqual(
      walksAfterFirstUpdate((round) =>
        spec(editor, (tx) => {
          tx.nodes.insert(P(`edit${round}`), {
            at: { path: [1000, 0], offset: 0, root: 'header' },
          });
          reinsertFirst(tx);
        })
      ),
      [0, 0, 0]
    );
  });

  it('walks as many slots to move a block after an update paste as in an editor that never pasted', () => {
    const slotsToMove = (pasted: number) => {
      const editor = createEditor({ initialValue: blocks('m', 2000) });

      if (pasted) {
        editor.update((tx) => {
          tx.selection.set(caretAt([1000, 0], 1));
          tx.fragment.replace(blocks('p', pasted));
        });
      }
      const move = () =>
        editor.update((tx) => {
          const node = tx.children()[1001];

          tx.nodes.remove({ at: [1001] });
          tx.nodes.insert(node, { at: [1001] });
        });

      move();
      const before = readCoreWork().walkedSlots;

      move();
      move();

      return readCoreWork().walkedSlots - before;
    };

    assert.equal(slotsToMove(100), slotsToMove(0));
  });

  it('walks no root to accept a spec paste after an earlier one lost its first block and was undone', () => {
    const editor = createEditor({ initialValue: blocks('m', 2000) });
    const original = { children: editor.read.children() };

    assert.deepEqual(
      [1, 2, 3, 4].map((round) => {
        const paste = spec(editor, (tx) => {
          tx.selection.set(caretAt([100, 0], 1));
          tx.fragment.replace(blocks(`q${round}-`, 100));
          tx.key([150]);
        });

        return walksOf(() => {
          editor.update(() => applyTransactionSpec(editor, paste));
          editor.update((tx) => tx.nodes.remove({ at: [101] }));
          editor.update((tx) =>
            tx.changes.apply(
              DocumentChange.between({ children: tx.children() }, original)
            )
          );
        });
      }),
      [0, 0, 0, 0]
    );
  });

  it('walks the index as often to move the new half of a split block as to move a block that was not split', () => {
    const walksToMove = (split: boolean) => {
      const editor = createEditor({
        initialValue: {
          children: blocks('m', 2000),
          roots: { header: [P('h')] },
        },
      });

      editor.update((tx) =>
        tx.text.insert('x', { at: { path: [5, 0], offset: 0 } })
      );

      return walksOf(() =>
        editor.update((tx) => {
          if (split) tx.nodes.split({ at: { path: [1000, 0], offset: 2 } });
          const at = split ? 1001 : 1000;
          const node = tx.children()[at];

          tx.nodes.remove({ at: [at] });
          tx.nodes.insert(node, { at: [0] });
        })
      );
    };

    assert.equal(walksToMove(true), walksToMove(false));
  });

  it('walks no other root to move a block an earlier update pasted', () => {
    const walksToMove = (header: boolean) => {
      const editor = createEditor({
        initialValue: header
          ? {
              children: blocks('m', 2000),
              roots: { header: blocks('h', 2000) },
            }
          : { children: blocks('m', 2000) },
      });

      editor.key([0]);
      editor.update((tx) => {
        tx.selection.set(caretAt([1000, 0], 1));
        tx.fragment.replace([P('a'), P('b'), P('c')]);
      });

      return walksOf(() =>
        editor.update((tx) => {
          const node = tx.children()[1001];

          tx.nodes.remove({ at: [1001] });
          tx.nodes.insert(node, { at: [0] });
        })
      );
    };

    assert.equal(walksToMove(true), walksToMove(false));
  });

  it('binds no more nodes to insert into a spec after hundreds of edits than after the most edits a spec waits to key', () => {
    const bindsToInsert = (edits: number) => {
      const editor = createEditor({ initialValue: blocks('m', 20) });
      let binds = 0;

      spec(editor, (tx) => {
        tx.selection.set(caretAt([5, 0], 1));
        tx.fragment.replace([P('a'), P('b'), P('c')]);
        for (let edit = 0; edit < edits; edit += 1) {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          });
          tx.fragment.replace([{ text: edit % 2 ? 'y' : 'x' }]);
        }
        const before = readCoreWork().landedNodeBinds;

        tx.nodes.insert(P('fresh'), { at: [0] });
        binds = readCoreWork().landedNodeBinds - before;
      });

      return binds;
    };
    const many = bindsToInsert(10 * MAX_DEFERRED_NODE_KEY_STEPS);
    const most = bindsToInsert(MAX_DEFERRED_NODE_KEY_STEPS - 2);

    assert.ok(
      many <= most,
      `${many} binds after many edits, ${most} after the most a spec waits`
    );
  });
});
