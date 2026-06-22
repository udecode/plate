import './index.js';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Editor, getEditorTransformRegistry } from '@platejs/slate/internal';
import * as SlateHistory from '../src';
import { History, history } from '../src';

const testsDir = dirname(fileURLToPath(import.meta.url));

const isFixtureFile = (file: string) =>
  (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
  !file.startsWith('.') &&
  file !== 'index.js' &&
  file !== 'index.spec.ts';

const getFixtureName = (file: string) => file.replace(/\.(tsx|ts|js)$/u, '');

const runFixtureTree = (
  path: string,
  runFixture: (module: Record<string, any>) => void
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
      const source = readFileSync(fixturePath, 'utf8');
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
  editor.extend(history());

  const { isInline, isVoid, isElementReadOnly, isSelectable } = editor;
  const transforms = () => getEditorTransformRegistry(editor);

  Object.defineProperties(editor, {
    delete: { value: (...args: any[]) => transforms().delete(...args) },
    deleteBackward: {
      value: (...args: any[]) => transforms().deleteBackward(...args),
    },
    deleteForward: {
      value: (...args: any[]) => transforms().deleteForward(...args),
    },
    deselect: { value: (...args: any[]) => transforms().deselect(...args) },
    insertBreak: {
      value: (...args: any[]) => transforms().insertBreak(...args),
    },
    insertFragment: {
      value: (...args: any[]) => transforms().insertFragment(...args),
    },
    insertText: {
      value: (...args: any[]) => transforms().insertText(...args),
    },
    move: { value: (...args: any[]) => transforms().move(...args) },
    redo: {
      value: () =>
        editor.update((tx) => {
          tx.history.redo();
        }),
    },
    select: { value: (...args: any[]) => transforms().select(...args) },
    undo: {
      value: () =>
        editor.update((tx) => {
          tx.history.undo();
        }),
    },
  });

  editor.isInline = (element: any) =>
    element.inline === true ? true : isInline(element);

  editor.isVoid = (element: any) =>
    element.void === true ? true : isVoid(element);

  editor.isElementReadOnly = (element: any) =>
    element.readOnly === true ? true : isElementReadOnly(element);

  editor.isSelectable = (element: any) =>
    element.nonSelectable === true ? false : isSelectable(element);

  return editor;
};

const getHistory = (editor: any) =>
  editor.read((state: any) => state.history.get());

describe('@platejs/slate-history', () => {
  it('exposes the current history extension surface', () => {
    assert.strictEqual(typeof SlateHistory.history, 'function');
    assert.strictEqual('withHistory' in SlateHistory, false);
  });

  runFixtureTree(resolve(testsDir, 'undo'), (module) => {
    const { input, output, run } = module;
    const editor = withTest(input);
    const initialSnapshot = Editor.getSnapshot(editor);
    const initialExpected = {
      children: structuredClone(initialSnapshot.children),
      selection: structuredClone(initialSnapshot.selection),
    };

    run(editor);
    editor.update((tx) => {
      tx.history.undo();
    });

    const snapshot = Editor.getSnapshot(editor);
    const expected = Editor.isEditor(output)
      ? Editor.getSnapshot(output)
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
