import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, defineExtension, type Editor, type Path } from 'plitejs';

type CustomText = {
  text: string;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomValue = ParagraphElement[];

const activePalettePaths = new WeakMap<Editor, Path | null>();

const paragraph = (text: string): ParagraphElement => ({
  type: 'paragraph',
  children: [{ text }],
});

const createNodePaletteExtension = () =>
  defineExtension('nodePalette', {
    api: ({ editor }) => ({
      clear() {
        activePalettePaths.set(editor, null);
      },
      select(path: Path) {
        activePalettePaths.set(editor, [...path] as Path);
      },
      selectedPath() {
        return activePalettePaths.get(editor) ?? null;
      },
    }),
    read: ({ editor }) => ({
      hasSelection: () => activePalettePaths.get(editor) != null,
      selectedPath: () => activePalettePaths.get(editor) ?? null,
    }),
    update: ({ editor, tx }) => ({
      removeSelected() {
        const path = activePalettePaths.get(editor);

        if (!path) {
          return;
        }

        tx.nodes.remove({ at: path });
        activePalettePaths.set(editor, null);
      },
      selectedPath: () => activePalettePaths.get(editor) ?? null,
    }),
  });

const createNodePaletteEditor = () =>
  createEditor<CustomValue>({
    initialValue: [paragraph('one'), paragraph('two')],
  });

const createInstalledNodePaletteEditor = () => {
  const extension = createNodePaletteExtension();

  return createEditor({
    extensions: [extension] as const,
    initialValue: [paragraph('one'), paragraph('two')],
  });
};

const assertTypes = (
  editor: ReturnType<typeof createInstalledNodePaletteEditor>
) => {
  editor.api.nodePalette.select([0]);

  editor.read((state) => {
    const hasSelection: boolean = state.nodePalette.hasSelection();

    // @ts-expect-error local editor actions are not deterministic read state
    state.nodePalette.select([0]);

    return hasSelection;
  });

  const directHasSelection: boolean = editor.read.nodePalette.hasSelection();
  const directSelectedPath: Path | null =
    editor.read.nodePalette.selectedPath();

  editor.update((tx) => {
    tx.nodePalette.removeSelected();

    // @ts-expect-error local editor actions are not transaction transforms
    tx.nodePalette.select([0]);
  });

  editor.update.nodePalette.removeSelected();

  void directHasSelection;
  void directSelectedPath;
};

const transpiledTypeof = (value: unknown) =>
  value &&
  typeof Symbol !== 'undefined' &&
  (value as { constructor?: unknown }).constructor === Symbol
    ? 'symbol'
    : typeof value;

describe('extension namespace contract', () => {
  it('installs API handles, state reads, and tx writes as one extension namespace', () => {
    const headlessEditor = createEditor<CustomValue>();
    const editor = createInstalledNodePaletteEditor();

    assert.equal('nodePalette' in headlessEditor, false);
    assert.equal(
      (headlessEditor.api as { nodePalette?: unknown }).nodePalette,
      undefined
    );
    assert.equal(editor.api.nodePalette.selectedPath(), null);
    assert.equal(
      editor.read((state) => state.nodePalette.hasSelection()),
      false
    );

    editor.api.nodePalette.select([1]);

    assert.deepEqual(editor.api.nodePalette.selectedPath(), [1]);
    assert.deepEqual(
      editor.read((state) => state.nodePalette.selectedPath()),
      [1]
    );
    assert.deepEqual(editor.read.nodePalette.selectedPath(), [1]);
    assert.equal(transpiledTypeof(editor.read.nodePalette), 'function');

    editor.update.nodePalette.removeSelected();

    assert.deepEqual(
      editor.read((state) => state.children()),
      [paragraph('one')]
    );
    assert.equal(editor.api.nodePalette.selectedPath(), null);

    const editorSurface = editor as unknown as Record<string, unknown>;
    assert.equal('tf' in editorSurface, false);
    assert.equal('commands' in editorSurface, false);
  });

  it('cleans up dynamically installed API, state, and tx extension namespaces', () => {
    const editor = createNodePaletteEditor();
    const cleanup = editor.install(createNodePaletteExtension());
    const api = editor.api as {
      nodePalette?: { selectedPath: () => Path | null };
    };

    assert.equal(api.nodePalette?.selectedPath(), null);
    assert.equal(
      editor.read((state) =>
        (
          state as typeof state & {
            nodePalette: { hasSelection: () => boolean };
          }
        ).nodePalette.hasSelection()
      ),
      false
    );

    cleanup();

    assert.equal(api.nodePalette, undefined);
    assert.equal(
      editor.read((state) => 'nodePalette' in state),
      false
    );
  });
});

void assertTypes;
