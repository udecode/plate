import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor } from '@platejs/plite';
import { syncSelectionForBeforeInput } from '../src/editable/selection-reconciler';
import {
  ReactEditor,
  type ReactRuntimeEditor,
} from '../src/plugin/react-editor';

const createRootWithoutSelection = () =>
  ({ getSelection: () => null }) as unknown as Document;

const createTextEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    marks: null,
    selection: {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });

  return editor;
};

describe('selection reconciler', () => {
  it('does not scan the whole document for a valid model-owned text insertion', () => {
    const editor = createTextEditor();
    const selection = editorGetSelection(editor);
    const originalString = editorString;

    try {
      editorString = () => {
        throw new Error('unexpected root string scan');
      };

      const result = syncSelectionForBeforeInput({
        allowDOMSelectionImport: false,
        data: 'x',
        editor: editor as ReactRuntimeEditor,
        editorElement: {} as HTMLElement,
        event: { getTargetRanges: () => [] } as unknown as InputEvent,
        inputType: 'insertText',
        isCompositionChange: false,
        native: false,
        preferModelSelectionForInput: true,
        root: createRootWithoutSelection(),
        selection,
      });

      assert.deepEqual(result.selection, selection);
      assert.equal(result.native, false);
    } finally {
      editorString = originalString;
    }
  });

  it('keeps native text insertion when the model selection is preferred but not forced', () => {
    const editor = createTextEditor();
    const selection = editorGetSelection(editor);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'x',
      editor: editor as ReactRuntimeEditor,
      editorElement: {} as HTMLElement,
      event: { getTargetRanges: () => [] } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: true,
      preferModelSelectionForInput: true,
      root: createRootWithoutSelection(),
      selection,
    });

    assert.deepEqual(result.selection, selection);
    assert.equal(result.native, true);
  });

  it('forces model-owned text insertion during structural command repair windows', () => {
    const editor = createTextEditor();
    const selection = editorGetSelection(editor);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'x',
      editor: editor as ReactRuntimeEditor,
      editorElement: {} as HTMLElement,
      event: { getTargetRanges: () => [] } as unknown as InputEvent,
      forceModelOwnedTextInput: true,
      inputType: 'insertText',
      isCompositionChange: false,
      native: true,
      preferModelSelectionForInput: true,
      root: createRootWithoutSelection(),
      selection,
    });

    assert.deepEqual(result.selection, selection);
    assert.equal(result.native, false);
  });

  it('imports expanded delete target ranges from blur-time IME cleanup events', () => {
    const editor = createTextEditor();
    const selection = editorGetSelection(editor);
    const targetRange = {} as StaticRange;
    const targetPliteRange = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    const originalHasSelectableTarget = ReactEditor.hasSelectableTarget;
    const originalResolvePliteRange = ReactEditor.resolvePliteRange;

    try {
      ReactEditor.hasSelectableTarget = () => true;
      ReactEditor.resolvePliteRange = () => targetPliteRange;

      const result = syncSelectionForBeforeInput({
        allowDOMSelectionImport: true,
        data: null,
        editor: editor as ReactRuntimeEditor,
        editorElement: {} as HTMLElement,
        event: {
          getTargetRanges: () => [targetRange],
        } as unknown as InputEvent,
        inputType: 'deleteContentBackward',
        isCompositionChange: false,
        native: false,
        preferModelSelectionForInput: false,
        root: createRootWithoutSelection(),
        selection,
      });

      assert.deepEqual(result.selection, targetPliteRange);
      assert.deepEqual(editorGetSelection(editor), targetPliteRange);
    } finally {
      ReactEditor.hasSelectableTarget = originalHasSelectableTarget;
      ReactEditor.resolvePliteRange = originalResolvePliteRange;
    }
  });

  it('does not import target ranges while preserving model-owned selection', () => {
    const editor = createTextEditor();
    const selection = editorGetSelection(editor);
    const targetRange = {} as StaticRange;
    const targetPliteRange = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    const originalHasSelectableTarget = ReactEditor.hasSelectableTarget;
    const originalResolvePliteRange = ReactEditor.resolvePliteRange;

    try {
      ReactEditor.hasSelectableTarget = () => true;
      ReactEditor.resolvePliteRange = () => targetPliteRange;

      const result = syncSelectionForBeforeInput({
        allowDOMSelectionImport: false,
        data: null,
        editor: editor as ReactRuntimeEditor,
        editorElement: {} as HTMLElement,
        event: {
          getTargetRanges: () => [targetRange],
        } as unknown as InputEvent,
        inputType: 'deleteContentBackward',
        isCompositionChange: false,
        native: false,
        preferModelSelectionForInput: true,
        root: createRootWithoutSelection(),
        selection,
      });

      assert.deepEqual(result.selection, selection);
      assert.deepEqual(editorGetSelection(editor), selection);
    } finally {
      ReactEditor.hasSelectableTarget = originalHasSelectableTarget;
      ReactEditor.resolvePliteRange = originalResolvePliteRange;
    }
  });

  it('imports expanded insertText target ranges for browser text substitutions', () => {
    const editor = createTextEditor();
    const selection = editorGetSelection(editor);
    const targetRange = {} as StaticRange;
    const targetPliteRange = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    };
    const originalHasSelectableTarget = ReactEditor.hasSelectableTarget;
    const originalResolvePliteRange = ReactEditor.resolvePliteRange;

    try {
      ReactEditor.hasSelectableTarget = () => true;
      ReactEditor.resolvePliteRange = () => targetPliteRange;

      const result = syncSelectionForBeforeInput({
        allowDOMSelectionImport: true,
        data: '. ',
        editor: editor as ReactRuntimeEditor,
        editorElement: {} as HTMLElement,
        event: {
          getTargetRanges: () => [targetRange],
        } as unknown as InputEvent,
        inputType: 'insertText',
        isCompositionChange: false,
        native: false,
        preferModelSelectionForInput: true,
        root: createRootWithoutSelection(),
        selection,
      });

      assert.deepEqual(result.selection, targetPliteRange);
      assert.deepEqual(editorGetSelection(editor), targetPliteRange);
    } finally {
      ReactEditor.hasSelectableTarget = originalHasSelectableTarget;
      ReactEditor.resolvePliteRange = originalResolvePliteRange;
    }
  });
});
