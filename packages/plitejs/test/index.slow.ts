import './index.js';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  createEditor,
  type Element,
  type EditorExtension,
  TextApi,
} from 'plitejs';

import { runEditorTransaction as runInternalEditorTransaction } from '../src/core/public-state';
import {
  getLastCommit as editorGetLastCommit,
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  insertNodes as editorInsertNodes,
  isEditor as editorIsEditor,
  replace as editorReplace,
} from '../src/internal';
import { isExplicitCutFixture } from './fixture-claim-overrides.js';
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
const fixtureFilter = process.env.PLITE_FIXTURE_FILTER?.trim() || null;

const isFixtureFile = (file: string) =>
  (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
  !file.endsWith('custom-types.ts') &&
  !file.endsWith('type-guards.ts') &&
  !file.startsWith('.') &&
  file !== 'index.js' &&
  file !== 'index.slow.ts';

const getFixtureName = (file: string) => file.replace(/\.(tsx|ts|js)$/u, '');

type FixtureModule = {
  input: any;
  output: any;
  run: (input: any) => any;
  test: (input: any) => any;
  withFallbackElement?: boolean;
};

const runFixtureTree = (
  path: string,
  runFixture: (module: FixtureModule, fixturePath: string) => void
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
      const source = readFileSync(fixturePath, 'utf-8');
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

        runFixture(module, fixturePath);
      });
    }
  });
};

const getExpectedSnapshot = (output: any) =>
  editorIsEditor(output) ? editorGetSnapshot(output) : output;

describe('plitejs', () => {
  runFixtureTree(resolve(testsDir, 'interfaces'), (module, fixturePath) => {
    const { output, test } = module;
    let { input } = module;

    if (editorIsEditor(input)) {
      input = withTest(input);
    }

    const actual = test(input);

    assert.deepEqual(actual, output, fixturePath);
  });

  runFixtureTree(resolve(testsDir, 'normalization'), (module, fixturePath) => {
    const { input, output, withFallbackElement } = module;
    const editor = withTest(input);

    if (withFallbackElement) {
      const fallbackExtension = {
        corrections: [
          {
            correct: ({ entry, tx }) => {
              const [node, path] = entry;

              if (TextApi.isText(node)) return;

              const children = editorIsEditor(node)
                ? editor.read((state) => state.children())
                : node.children;
              const firstChild = children[0];

              if (
                path.length > 0 &&
                (editor.read.schema.isInline(node) ||
                  TextApi.isText(firstChild) ||
                  (firstChild && editor.read.schema.isInline(firstChild)))
              ) {
                return;
              }

              const index = children.findIndex(
                (child) =>
                  TextApi.isText(child) || editor.read.schema.isInline(child)
              );

              if (index === -1) return;

              tx.nodes.wrap(
                { type: 'paragraph', children: [] },
                { at: [...path, index] }
              );
            },
            event: 'content',
          },
          {
            correct(context) {
              fallbackExtension.corrections[0].correct(context);
            },
            event: 'content',
            query: 'root',
          },
        ],
        name: `fixture-root-content-${fixturePath}`,
      } satisfies EditorExtension;

      editor.install(fallbackExtension);
    }

    editor.update.value.repair();

    const snapshot = editorGetSnapshot(editor);
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

    const snapshot = editorGetSnapshot(editor);
    const expected = getExpectedSnapshot(output);

    assert.deepEqual(snapshot.children, expected.children, fixturePath);
    assert.deepEqual(snapshot.selection, expected.selection, fixturePath);
  });

  runFixtureTree(
    resolve(testsDir, 'utils/deep-equal'),
    (module, fixturePath) => {
      const { output, test } = module;
      let { input } = module;

      if (editorIsEditor(input)) {
        input = withTest(input);
      }

      assert.deepEqual(test(input), output, fixturePath);
    }
  );

  describe('node keys', () => {
    it('keeps same-object nodes owner-scoped across editors', () => {
      const shared: Element = {
        type: 'paragraph',
        children: [{ text: 'shared' }],
      };
      const other: Element = {
        type: 'paragraph',
        children: [{ text: 'other' }],
      };
      const editor1 = createEditor();
      const editor2 = createEditor();

      editorInsertNodes(editor1, shared, { at: [0] });
      assert.ok(editorGetNodeKey(editor1, [0]));

      editorInsertNodes(editor2, shared, { at: [0] });
      editorInsertNodes(editor2, other, { at: [1] });

      const paths = [[0], [0, 0], [1], [1, 0]];
      const nodeKeys = paths.map((path) => {
        const nodeKey = editorGetNodeKey(editor2, path);

        assert.ok(nodeKey);
        assert.deepEqual(editorGetPathByNodeKey(editor2, nodeKey), path);

        return nodeKey;
      });

      assert.equal(new Set(nodeKeys).size, nodeKeys.length);
    });
  });

  describe('selection updates', () => {
    it('does not publish a commit for a null-to-null selection update', () => {
      const editor = createEditor();

      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'one' }],
          },
        ],
        selection: null,
      });

      const lastCommit = editorGetLastCommit(editor);

      runEditorTransaction(editor, (tx) => {
        tx.setSelection(null);
      });

      assert.equal(editorGetLastCommit(editor), lastCommit);
    });
  });
});
