import './index.js';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cloneDeep } from 'lodash';
import { createEditor, type Descendant } from '@platejs/slate';
import { Editor, getEditorRuntime } from '@platejs/slate/internal';
import { runEditorTransaction as runInternalEditorTransaction } from '../src/core/public-state';
import {
  IMPLICIT_CANONICALIZATION_CUT_REASON,
  isExplicitCutFixture,
} from './fixture-claim-overrides.js';
import { createFixtureTransactionApi, withTest } from './support/with-test.js';

const runEditorTransaction = (
  editor: Parameters<typeof runInternalEditorTransaction>[0],
  fn: Parameters<typeof runInternalEditorTransaction>[1],
  options: Parameters<typeof runInternalEditorTransaction>[2] = {}
) =>
  runInternalEditorTransaction(editor, fn, {
    authority: 'explicit',
    ...options,
  });

const testsDir = dirname(fileURLToPath(import.meta.url));
const fixtureFilter = process.env.SLATE_FIXTURE_FILTER?.trim() || null;

const isFixtureFile = (file: string) =>
  (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
  !file.endsWith('custom-types.ts') &&
  !file.endsWith('type-guards.ts') &&
  !file.startsWith('.') &&
  file !== 'index.js' &&
  file !== 'index.spec.ts';

const getFixtureName = (file: string) => file.replace(/\.(tsx|ts|js)$/u, '');

const runFixtureTree = (
  path: string,
  runFixture: (module: Record<string, any>, fixturePath: string) => void
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
      if (fixtureFilter && !fixturePath.includes(fixtureFilter)) continue;

      const name = getFixtureName(file);
      const source = readFileSync(fixturePath, 'utf8');
      const fixturePathFromTestRoot = relative(
        testsDir,
        fixturePath
      ).replaceAll('\\', '/');
      const isExplicitCut = isExplicitCutFixture(fixturePathFromTestRoot);
      const testFn = /\bexport const skip\s*=\s*true\b/.test(source)
        ? it.skip
        : isExplicitCut
          ? it.skip
          : it;

      testFn(name, async () => {
        const module = (await import(
          pathToFileURL(fixturePath).href
        )) as Record<string, any>;

        if (process.env.SLATE_FIXTURE_DEBUG === '1') {
          console.log('[fixture]', fixturePath);
          if (isExplicitCut) {
            console.log('[cut]', IMPLICIT_CANONICALIZATION_CUT_REASON);
          }
        }

        runFixture(module, fixturePath);
      });
    }
  });
};

const withBatchTest = (editor: Editor, dirties: string[]) => {
  const runtime = getEditorRuntime(editor);
  const { normalizeNode } = runtime;

  runtime.normalizeNode = ([node, path]) => {
    dirties.push(JSON.stringify(path));
    normalizeNode([node, path]);
  };

  return editor;
};

const getExpectedSnapshot = (output: any) =>
  Editor.isEditor(output) ? Editor.getSnapshot(output) : output;

describe('@platejs/slate', () => {
  runFixtureTree(resolve(testsDir, 'interfaces'), (module, fixturePath) => {
    let { input, test, output } = module;

    if (Editor.isEditor(input)) {
      input = withTest(input);
    }

    const actual = test(input);

    if (process.env.SLATE_FIXTURE_DEBUG === '1') {
      console.log('[actual]', JSON.stringify(actual));
      console.log('[expected]', JSON.stringify(output));
      if (Editor.isEditor(input)) {
        const snapshot = Editor.getSnapshot(input);
        console.log('[selection]', JSON.stringify(snapshot.selection));
        console.log('[children]', JSON.stringify(snapshot.children));
      }
    }

    assert.deepEqual(actual, output, fixturePath);
  });

  runFixtureTree(resolve(testsDir, 'operations'), (module, fixturePath) => {
    const { input, operations, output } = module;
    const editor = withTest(input);

    runEditorTransaction(editor, (transaction) => {
      Editor.withoutNormalizing(editor, () => {
        for (const op of operations) {
          transaction.apply(op);
        }
      });
    });

    const snapshot = Editor.getSnapshot(editor);
    const expected = getExpectedSnapshot(output);

    assert.deepEqual(snapshot.children, expected.children, fixturePath);
    assert.deepEqual(snapshot.selection, expected.selection, fixturePath);
  });

  runFixtureTree(resolve(testsDir, 'normalization'), (module, fixturePath) => {
    const { input, output, withFallbackElement } = module;
    const editor = withTest(input);

    if (withFallbackElement) {
      const runtime = getEditorRuntime(editor);
      const { normalizeNode } = runtime;

      runtime.normalizeNode = (entry, options) => {
        normalizeNode(entry, { ...options, fallbackElement: () => ({}) });
      };
    }

    editor.update((tx) => {
      Editor.normalize(editor, { force: true });
    });

    const snapshot = Editor.getSnapshot(editor);
    const expected = getExpectedSnapshot(output);

    assert.deepEqual(snapshot.children, expected.children, fixturePath);
    assert.deepEqual(snapshot.selection, expected.selection, fixturePath);
  });

  runFixtureTree(resolve(testsDir, 'transforms'), (module, fixturePath) => {
    const { input, output, run } = module;
    const editor = withTest(input);

    editor.update((tx) => {
      run(createFixtureTransactionApi(editor, tx));
    });

    const snapshot = Editor.getSnapshot(editor);
    const expected = getExpectedSnapshot(output);

    assert.deepEqual(snapshot.children, expected.children, fixturePath);
    assert.deepEqual(snapshot.selection, expected.selection, fixturePath);
  });

  runFixtureTree(
    resolve(testsDir, 'utils/deep-equal'),
    (module, fixturePath) => {
      let { input, test, output } = module;

      if (Editor.isEditor(input)) {
        input = withTest(input);
      }

      assert.deepEqual(test(input), output, fixturePath);
    }
  );

  describe('runtime ids', () => {
    it('keeps same-object nodes owner-scoped across editors', () => {
      const shared: Descendant = {
        type: 'paragraph',
        children: [{ text: 'shared' }],
      };
      const other: Descendant = {
        type: 'paragraph',
        children: [{ text: 'other' }],
      };
      const editor1 = createEditor();
      const editor2 = createEditor();

      Editor.insertNodes(editor1, shared, { at: [0] });
      assert(Editor.getRuntimeId(editor1, [0]));

      Editor.insertNodes(editor2, shared, { at: [0] });
      Editor.insertNodes(editor2, other, { at: [1] });

      const paths = [[0], [0, 0], [1], [1, 0]];
      const runtimeIds = paths.map((path) => {
        const runtimeId = Editor.getRuntimeId(editor2, path);

        assert(runtimeId);
        assert.deepEqual(Editor.getPathByRuntimeId(editor2, runtimeId), path);

        return runtimeId;
      });

      assert.equal(new Set(runtimeIds).size, runtimeIds.length);
    });
  });

  describe('schema', () => {
    it('rolls back earlier specs when batch registration fails', () => {
      const editor = createEditor();
      const schema = getEditorRuntime(editor).schema;

      assert.throws(() => {
        schema.define([{ type: 'atomic-a' }, { type: 'atomic-a' }]);
      }, /conflicts/);
      assert.equal(schema.getElementSpec('atomic-a'), null);
    });
  });

  describe('selection operations', () => {
    it('does not emit a selection operation for null-to-null selection updates', () => {
      const editor = createEditor();

      Editor.replace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'one' }],
          },
        ],
        selection: null,
        marks: null,
      });

      const operationCount = Editor.getOperations(editor).length;
      const lastCommit = Editor.getLastCommit(editor);

      runEditorTransaction(editor, (tx) => {
        tx.setSelection(null);
      });

      assert.equal(Editor.getOperations(editor).length, operationCount);
      assert.equal(Editor.getLastCommit(editor), lastCommit);
    });
  });

  describe('batchDirty', () => {
    const runBatchDirtyTree = (path: string) => {
      runFixtureTree(path, (module) => {
        const { input, run } = module;
        const input2 = createEditor();
        const snapshot = Editor.getSnapshot(input);

        Editor.replace(input2, {
          children: cloneDeep(snapshot.children),
          selection: cloneDeep(snapshot.selection),
          marks: cloneDeep(snapshot.marks),
        });

        const dirties1: string[] = [];
        const dirties2: string[] = [];

        const editor1 = withBatchTest(withTest(input), dirties1);
        const editor2 = withBatchTest(withTest(input2), dirties2);

        editor1.update((tx) => {
          run(createFixtureTransactionApi(editor1, tx), { batchDirty: true });
        });
        editor2.update((tx) => {
          run(createFixtureTransactionApi(editor2, tx), { batchDirty: false });
        });

        assert.equal(dirties1.join(' '), dirties2.join(' '));
      });
    };

    runBatchDirtyTree(resolve(testsDir, 'transforms/insertNodes'));
    runBatchDirtyTree(resolve(testsDir, 'transforms/insertFragment'));
  });
});
