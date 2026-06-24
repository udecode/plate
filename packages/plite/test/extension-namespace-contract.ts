import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createEditor,
  defineEditorExtension,
  type Editor,
  type Path,
  type Value,
} from '@platejs/plite';

type CustomText = {
  text: string;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomValue = ParagraphElement[];

declare module '@platejs/plite' {
  interface EditorStateExtensionGroups<V extends Value = Value> {
    blockSelection: {
      hasSelection: () => boolean;
      selectedPath: () => Path | null;
    };
  }

  interface EditorTxExtensionGroups<V extends Value = Value> {
    blockSelection: {
      removeSelected: () => void;
      selectedPath: () => Path | null;
    };
  }
}

const selectedBlockPaths = new WeakMap<Editor, Path | null>();

const paragraph = (text: string): ParagraphElement => ({
  type: 'paragraph',
  children: [{ text }],
});

const createBlockSelectionExtension = <TEditor extends Editor<CustomValue>>() =>
  defineEditorExtension<TEditor>({
    name: 'block-selection-contract',
    setup({ editor }) {
      return {
        api: {
          blockSelection: {
            clear() {
              selectedBlockPaths.set(editor, null);
            },
            select(path) {
              selectedBlockPaths.set(editor, [...path] as Path);
            },
            selectedPath() {
              return selectedBlockPaths.get(editor) ?? null;
            },
          },
        },
      };
    },
    state: {
      blockSelection(_state, editor) {
        return {
          hasSelection: () => selectedBlockPaths.get(editor) != null,
          selectedPath: () => selectedBlockPaths.get(editor) ?? null,
        };
      },
    },
    tx: {
      blockSelection(tx, editor) {
        return {
          removeSelected() {
            const path = selectedBlockPaths.get(editor);

            if (!path) {
              return;
            }

            tx.nodes.remove({ at: path });
            selectedBlockPaths.set(editor, null);
          },
          selectedPath: () => selectedBlockPaths.get(editor) ?? null,
        };
      },
    },
  });

const createBlockSelectionEditor = () =>
  createEditor<CustomValue>({
    initialValue: [paragraph('one'), paragraph('two')],
  });

const createInstalledBlockSelectionEditor = () => {
  const extension = createBlockSelectionExtension();

  return createEditor<CustomValue, readonly [typeof extension]>({
    extensions: [extension] as const,
    initialValue: [paragraph('one'), paragraph('two')],
  });
};

const assertTypes = (
  editor: ReturnType<typeof createInstalledBlockSelectionEditor>
) => {
  editor.api.blockSelection.select([0]);

  editor.read((state) => {
    const hasSelection: boolean = state.blockSelection.hasSelection();

    // @ts-expect-error local editor actions are not deterministic read state
    state.blockSelection.select([0]);

    return hasSelection;
  });

  editor.update((tx) => {
    tx.blockSelection.removeSelected();

    // @ts-expect-error local editor actions are not transaction transforms
    tx.blockSelection.select([0]);
  });
};

describe('extension namespace contract', () => {
  it('installs API handles, state reads, and tx writes as one extension namespace', () => {
    const headlessEditor = createEditor<CustomValue>();
    const editor = createInstalledBlockSelectionEditor();

    assert.equal('blockSelection' in headlessEditor, false);
    assert.equal(
      (headlessEditor.api as { blockSelection?: unknown }).blockSelection,
      undefined
    );
    assert.equal(editor.api.blockSelection.selectedPath(), null);
    assert.equal(
      editor.read((state) => state.blockSelection.hasSelection()),
      false
    );

    editor.api.blockSelection.select([1]);

    assert.deepEqual(editor.api.blockSelection.selectedPath(), [1]);
    assert.deepEqual(
      editor.read((state) => state.blockSelection.selectedPath()),
      [1]
    );

    editor.update((tx) => {
      assert.deepEqual(tx.blockSelection.selectedPath(), [1]);
      tx.blockSelection.removeSelected();
    });

    assert.deepEqual(
      editor.read((state) => state.value.root()),
      [paragraph('one')]
    );
    assert.equal(editor.api.blockSelection.selectedPath(), null);

    const editorSurface = editor as unknown as Record<string, unknown>;
    assert.equal('tf' in editorSurface, false);
    assert.equal('commands' in editorSurface, false);
  });

  it('cleans up dynamically installed API, state, and tx extension namespaces', () => {
    const editor = createBlockSelectionEditor();
    const cleanup = editor.extend(createBlockSelectionExtension());
    const api = editor.api as {
      blockSelection?: { selectedPath: () => Path | null };
    };

    assert.equal(api.blockSelection?.selectedPath(), null);
    assert.equal(
      editor.read((state) => state.blockSelection.hasSelection()),
      false
    );

    cleanup();

    assert.equal(api.blockSelection, undefined);
    assert.equal(
      editor.read((state) => 'blockSelection' in state),
      false
    );
  });
});

void assertTypes;
