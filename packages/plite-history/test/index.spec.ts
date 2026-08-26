import './index.js';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createEditor, createEditorView } from '@platejs/plite';
import {
  delete as editorDelete,
  deleteBackward as editorDeleteBackward,
  deleteForward as editorDeleteForward,
  deselect as editorDeselect,
  getSnapshot as editorGetSnapshot,
  hasEditorRuntime,
  insertBreak as editorInsertBreak,
  insertText as editorInsertText,
  move as editorMove,
  select as editorSelect,
} from '@platejs/plite/internal';

import * as PliteHistory from '../src';
import { History, history } from '../src';

const testsDir = dirname(fileURLToPath(import.meta.url));

const isFixtureFile = (file: string) =>
  (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
  !file.startsWith('.') &&
  file !== 'index.js' &&
  file !== 'index.spec.ts';

const getFixtureName = (file: string) => file.replace(/\.(tsx|ts|js)$/u, '');

type FixtureModule = {
  input: any;
  output: any;
  run: (editor: any) => any;
};

const runFixtureTree = (
  path: string,
  runFixture: (module: FixtureModule) => void
) => {
  describe(basename(path), () => {
    for (const file of readdirSync(path).sort()) {
      const fixturePath = resolve(path, file);
      const stat = statSync(fixturePath);

      if (stat.isDirectory()) {
        runFixtureTree(fixturePath, runFixture);
        continue;
      }

      if (!stat.isFile() || !isFixtureFile(file)) continue;

      const name = getFixtureName(file);
      const source = readFileSync(fixturePath, 'utf-8');
      const testFn = /\bexport const skip\s*=\s*true\b/.test(source)
        ? it.skip
        : it;

      testFn(name, async () => {
        const module = (await import(
          pathToFileURL(fixturePath).href
        )) as Record<string, any>;

        runFixture(module);
      });
    }
  });
};

const withTest = (editor: any) => {
  editor.install(history());

  Object.defineProperties(editor, {
    delete: {
      value: (...args: any[]) => {
        editorDelete(editor, ...args);
      },
    },
    deleteBackward: {
      value: (...args: any[]) => editorDeleteBackward(editor, ...args),
    },
    deleteForward: {
      value: (...args: any[]) => {
        editorDeleteForward(editor, ...args);
      },
    },
    deselect: {
      value: (...args: any[]) => {
        editorDeselect(editor, ...args);
      },
    },
    insertBreak: {
      value: (...args: any[]) => editorInsertBreak(editor, ...args),
    },
    insertText: {
      value: (...args: any[]) => {
        editorInsertText(editor, ...args);
      },
    },
    move: {
      value: (...args: any[]) => {
        editorMove(editor, ...args);
      },
    },
    redo: {
      value: () =>
        editor.update((tx) => {
          tx.history.redo();
        }),
    },
    select: {
      value: (...args: any[]) => {
        editorSelect(editor, ...args);
      },
    },
    undo: {
      value: () =>
        editor.update((tx) => {
          tx.history.undo();
        }),
    },
  });

  return editor;
};

const getHistory = (editor: any) =>
  editor.read((state: any) => state.history());

describe('@platejs/plite-history', () => {
  it('exposes the current history extension surface', () => {
    assert.strictEqual(typeof PliteHistory.history, 'function');
    assert.strictEqual('withHistory' in PliteHistory, false);
  });

  it('records before and after selection roots from the commit', () => {
    const runtime = createEditor({
      extensions: [history()],
      initialValue: {
        children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
        roots: {
          header: [{ children: [{ text: 'header' }], type: 'paragraph' }],
        },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const mainEditor = createEditorView(runtime);
    const headerSelection = {
      kind: 'text' as const,
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };

    headerEditor.update((tx) => tx.selection.set(headerSelection));
    runtime.update((tx) => {
      tx.text.insert('!', {
        at: { offset: 6, path: [0, 0], root: 'header' },
      });
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
    });

    const batch = getHistory(runtime).undos.at(-1);

    assert.equal(batch?.selectionBeforeRoot, 'header');
    assert.equal(batch?.selectionAfterRoot, undefined);
    assert.equal(Object.hasOwn(batch, 'selectionAfterRoot'), false);

    headerEditor.update((tx) => tx.history.undo());

    assert.deepEqual(headerEditor.read.selection(), {
      anchor: { offset: 2, path: [0, 0], root: 'header' },
      focus: { offset: 2, path: [0, 0], root: 'header' },
    });
    assert.equal(mainEditor.read.selection(), null);
  });

  runFixtureTree(resolve(testsDir, 'undo'), (module) => {
    const { input, output, run } = module;
    const editor = withTest(input);
    const initialSnapshot = editorGetSnapshot(editor);
    const initialExpected = {
      children: structuredClone(initialSnapshot.children),
      selection: structuredClone(initialSnapshot.selection),
    };

    run(editor);
    editor.update((tx) => {
      tx.history.undo();
    });

    const snapshot = editorGetSnapshot(editor);
    const expected = hasEditorRuntime(output)
      ? editorGetSnapshot(output)
      : output?.children !== undefined || output?.selection !== undefined
        ? output
        : initialExpected;

    assert.deepEqual(snapshot.children, expected.children);
    assert.deepEqual(snapshot.selection, expected.selection);
  });

  runFixtureTree(resolve(testsDir, 'isHistory'), (module) => {
    const { input, output, run } = module;
    const editor = withTest(input);

    run(editor);

    assert.strictEqual(History.isHistory(getHistory(editor)), output);
  });
});
