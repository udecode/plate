import { createEditor, defineEditorExtension } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { describe, expect, it, vi } from 'vitest';
import type { ReactEditor } from '../src';

import {
  applyEditableInput,
  applyModelOwnedBeforeInputOperation,
  applyModelOwnedNativeHistoryEvent,
} from '../src/editable/model-input-strategy';
import { applyModelOwnedDataTransferInput } from '../src/editable/mutation-controller';

const createTextEditor = (text = '', offset = 0, type = 'paragraph') => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [{ type, children: [{ text }] }],
    marks: null,
    selection: {
      anchor: { path: [0, 0], offset },
      focus: { path: [0, 0], offset },
    },
  });

  return editor;
};

const createTwoBlockTextEditor = (
  firstText: string,
  secondText: string,
  secondOffset = secondText.length
) => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: firstText }] },
      { type: 'paragraph', children: [{ text: secondText }] },
    ],
    marks: null,
    selection: {
      anchor: { path: [1, 0], offset: secondOffset },
      focus: { path: [1, 0], offset: secondOffset },
    },
  });

  return editor;
};

describe('model input strategy', () => {
  it('routes model-owned data transfer input through the editable command boundary', () => {
    const editor = createTextEditor();
    const data = {} as DataTransfer;
    let insertCount = 0;

    (editor as any).api = {
      clipboard: {
        insertData(receivedData: DataTransfer) {
          insertCount++;
          expect(receivedData).toBe(data);

          return true;
        },
      },
    };

    expect(
      applyModelOwnedDataTransferInput({
        data,
        editor: editor as ReactEditor,
      })
    ).toBe(true);
    expect(insertCount).toBe(1);
  });

  it('routes model-owned insert-data beforeinput through the same command boundary', () => {
    const editor = createTextEditor();
    const data = {} as DataTransfer;
    let insertCount = 0;

    (editor as any).api = {
      clipboard: {
        insertData(receivedData: DataTransfer) {
          insertCount++;
          expect(receivedData).toBe(data);

          return true;
        },
      },
    };

    expect(
      applyModelOwnedBeforeInputOperation({
        command: {
          data,
          kind: 'insert-data',
        },
        data,
        deferredOperations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertFromPaste',
        native: false,
        selection: Editor.getSelection(editor),
        setComposing: () => {},
      })
    ).toEqual({ kind: 'repair-caret' });
    expect(insertCount).toBe(1);
  });

  it('executes the prepared beforeinput command instead of reparsing event data', () => {
    const editor = createTextEditor();

    applyModelOwnedBeforeInputOperation({
      command: {
        inputType: 'insertText',
        kind: 'insert-text',
        text: 'kernel',
      },
      data: 'event',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('kernel');
  });

  it('uses the synced collapsed selection for model-owned insertText', () => {
    const editor = createTextEditor('abcd', 2);
    const selection = Editor.getSelection(editor);

    applyModelOwnedBeforeInputOperation({
      command: {
        inputType: 'insertText',
        kind: 'insert-text',
        text: '!',
      },
      data: '!',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('ab!cd');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('uses the direct collapsed insert path for empty marks', () => {
    const editor = createTextEditor('abcd', 2);
    const events: { id: string; kind: string }[] = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__SLATE_REACT_RENDER_PROFILER__;

    (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__SLATE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputOperation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: '!',
        },
        data: '!',
        deferredOperations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: Editor.getSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __SLATE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(Editor.string(editor, [])).toBe('ab!cd');
    expect(
      events.some((event) => event.id === 'model-text-input-read-marks')
    ).toBe(false);
    expect(
      events.some(
        (event) => event.id === 'model-text-input-insert-at-selection'
      )
    ).toBe(true);
    expect(
      events.some((event) => event.id === 'model-text-input-apply-command')
    ).toBe(false);
  });

  it('uses the direct collapsed insert path at the start of a plain leaf', () => {
    const editor = createTextEditor('', 0);
    const events: { id: string; kind: string }[] = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__SLATE_REACT_RENDER_PROFILER__;

    (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__SLATE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputOperation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: 'a',
        },
        data: 'a',
        deferredOperations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: Editor.getSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __SLATE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(Editor.string(editor, [])).toBe('a');
    expect(
      events.some((event) => event.id === 'model-text-input-read-marks')
    ).toBe(false);
    expect(
      events.some(
        (event) => event.id === 'model-text-input-insert-at-selection'
      )
    ).toBe(true);
    expect(
      events.some((event) => event.id === 'model-text-input-apply-command')
    ).toBe(false);
  });

  it('uses the direct collapsed insert path at the start of a nested plain leaf', () => {
    const editor = createEditor();
    const events: { id: string; kind: string }[] = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__SLATE_REACT_RENDER_PROFILER__;

    Editor.replace(editor, {
      children: [
        {
          type: 'quote',
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        },
      ],
      marks: null,
      selection: {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });

    (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__SLATE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputOperation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: 'a',
        },
        data: 'a',
        deferredOperations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: Editor.getSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __SLATE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(Editor.string(editor, [])).toBe('a');
    expect(
      events.some((event) => event.id === 'model-text-input-read-marks')
    ).toBe(false);
    expect(
      events.some(
        (event) => event.id === 'model-text-input-insert-at-selection'
      )
    ).toBe(true);
    expect(
      events.some((event) => event.id === 'model-text-input-apply-command')
    ).toBe(false);
  });

  it('does not use the direct collapsed insert path when empty marks clear a marked leaf', () => {
    const editor = createEditor();
    const selection = {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    };
    const events: { id: string; kind: string }[] = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__SLATE_REACT_RENDER_PROFILER__;

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Bold', bold: true }],
        },
      ],
      marks: {},
      selection,
    });

    (
      globalThis as typeof globalThis & {
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__SLATE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputOperation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: ' Plain',
        },
        data: ' Plain',
        deferredOperations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: Editor.getSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __SLATE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__SLATE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(Editor.getChildren(editor)).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Bold', bold: true }, { text: ' Plain' }],
      },
    ]);
    expect(
      events.some(
        (event) => event.id === 'model-text-input-insert-at-selection'
      )
    ).toBe(false);
    expect(
      events.some((event) => event.id === 'model-text-input-apply-command')
    ).toBe(true);
  });

  it('replaces expanded beforeinput target ranges with typed text', () => {
    const editor = createEditor();
    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    };

    Editor.replace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
      marks: null,
      selection,
    });

    applyModelOwnedBeforeInputOperation({
      command: {
        inputType: 'insertText',
        kind: 'insert-text',
        text: 'X',
      },
      data: 'X',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('X');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  it('routes model-owned insertText through transform middleware', () => {
    const editor = createTextEditor('-', 1);

    editor.extend(
      defineEditorExtension({
        name: 'markdown-shortcut-transform',
        transforms: {
          insertText({ editor, next, text }) {
            if (text === ' ') {
              editor.update((tx) => {
                tx.selection.set({
                  anchor: { path: [0, 0], offset: 0 },
                  focus: { path: [0, 0], offset: 1 },
                });
                tx.text.delete();
                tx.nodes.set({ type: 'list-item' });
              });
              return true;
            }

            return next();
          },
        },
      })
    );

    applyModelOwnedBeforeInputOperation({
      data: ' ',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(editor.read((state) => state.nodes.get([0])[0])).toEqual({
      type: 'list-item',
      children: [{ text: '' }],
    });
  });

  it('routes Android-style replacement text through model-owned beforeinput', () => {
    const editor = createTextEditor('alpha beta');
    const selection = {
      anchor: { path: [0, 0], offset: 'alpha '.length },
      focus: { path: [0, 0], offset: 'alpha beta'.length },
    };

    Editor.select(editor, selection);

    const repair = applyModelOwnedBeforeInputOperation({
      data: 'omega',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('alpha omega');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 'alpha omega'.length },
      focus: { path: [0, 0], offset: 'alpha omega'.length },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('replaces an autocorrect prefix without appending after it', () => {
    const editor = createTextEditor('i', 1);
    const insertSelection = Editor.getSelection(editor);

    applyModelOwnedBeforeInputOperation({
      data: 'S',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: insertSelection,
      setComposing: () => {},
    });

    const replacementSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };

    Editor.select(editor, replacementSelection);

    const repair = applyModelOwnedBeforeInputOperation({
      data: 'I',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection: replacementSelection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('IS');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('uses the provided replacement target after native text repair moves selection', () => {
    const editor = createTextEditor('iS', 2);
    const replacementSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };

    const repair = applyModelOwnedBeforeInputOperation({
      data: 'I',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection: replacementSelection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('IS');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('transposes adjacent characters from insertTranspose beforeinput', () => {
    const editor = createTextEditor('abc', 1);

    const firstRepair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertTranspose',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('bac');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
    expect(firstRepair).toEqual({
      focus: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });

    const secondRepair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertTranspose',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('bca');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    expect(secondRepair).toEqual(firstRepair);
  });

  it('splits a custom block on Enter without dropping follow-up text', () => {
    const editor = createTextEditor('Heading', 'Heading'.length, 'heading-one');
    const selection = Editor.getSelection(editor);

    const repair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertParagraph',
      native: false,
      selection,
      setComposing: () => {},
    });

    const [heading, paragraph] = Editor.getChildren(editor) as any[];

    expect(heading.type).toBe('heading-one');
    expect(Editor.string(editor, [0])).toBe('Heading');
    expect(paragraph.type).toBe('heading-one');
    expect(Editor.string(editor, [1])).toBe('');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    expect(repair).toEqual({
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });

    applyModelOwnedBeforeInputOperation({
      data: 'A',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [1])).toBe('A');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  it('routes Android-style first-line autocorrect through empty-state replacement text', () => {
    const editor = createTextEditor();
    const selection = Editor.getSelection(editor);

    const repair = applyModelOwnedBeforeInputOperation({
      data: 'hello',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('hello');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 'hello'.length },
      focus: { path: [0, 0], offset: 'hello'.length },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('keeps Android-style newline after composition from swallowing follow-up text', () => {
    const editor = createTextEditor();

    applyModelOwnedBeforeInputOperation({
      data: 'hello',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertFromComposition',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [0])).toBe('hello');

    applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertParagraph',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    const [first, second] = Editor.getChildren(editor) as any[];

    expect(first.type).toBe('paragraph');
    expect(second.type).toBe('paragraph');
    expect(Editor.string(editor, [0])).toBe('hello');
    expect(Editor.string(editor, [1])).toBe('');

    applyModelOwnedBeforeInputOperation({
      data: 'world',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [1])).toBe('world');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [1, 0], offset: 'world'.length },
      focus: { path: [1, 0], offset: 'world'.length },
    });
  });

  it('routes Android-style backspace through model-owned beforeinput', () => {
    const editor = createTextEditor('abcd', 2);
    const selection = Editor.getSelection(editor);

    const repair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteContentBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('acd');
    expect(repair).toEqual({
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  });

  it.each([
    'deleteByCut',
    'deleteByDrag',
  ] as const)('deletes the selected fragment from %s beforeinput', (inputType) => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
      marks: null,
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    const repair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType,
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('ad');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(repair).toEqual({
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  });

  it('deletes the current hard line backward without touching the previous block', () => {
    const editor = createTwoBlockTextEditor('foobar', 'baz');
    const selection = Editor.getSelection(editor);

    const repair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteHardLineBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [0])).toBe('foobar');
    expect(Editor.string(editor, [1])).toBe('');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    expect(repair).toEqual({
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  });

  it('deletes forward to the current line end without touching the next block', () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'foobar' }] },
        { type: 'paragraph', children: [{ text: 'baz' }] },
      ],
      marks: null,
      selection: {
        anchor: { path: [0, 0], offset: 'foo'.length },
        focus: { path: [0, 0], offset: 'foo'.length },
      },
    });

    const repair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteSoftLineForward',
      native: false,
      selection: Editor.getSelection(editor),
      setComposing: () => {},
    });

    expect(Editor.string(editor, [0])).toBe('foo');
    expect(Editor.string(editor, [1])).toBe('baz');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 'foo'.length },
      focus: { path: [0, 0], offset: 'foo'.length },
    });
    expect(repair).toEqual({
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  });

  it('keeps Android-style empty-state backspace from mutating placeholder text', () => {
    const editor = createTextEditor();
    const selection = Editor.getSelection(editor);

    const repair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteContentBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    expect(repair).toEqual({
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  });

  it('replaces expanded CJK composition selection once', () => {
    const editor = createTextEditor('prefix stale suffix');
    const selection = {
      anchor: { path: [0, 0], offset: 'prefix '.length },
      focus: { path: [0, 0], offset: 'prefix stale'.length },
    };

    Editor.select(editor, selection);

    const repair = applyModelOwnedBeforeInputOperation({
      data: '中文',
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertFromComposition',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('prefix 中文 suffix');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 'prefix 中文'.length },
      focus: { path: [0, 0], offset: 'prefix 中文'.length },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('deletes expanded CJK composition selection once', () => {
    const editor = createTextEditor('中文');
    const selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    };

    Editor.select(editor, selection);

    const repair = applyModelOwnedBeforeInputOperation({
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteByComposition',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('中');
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(repair).toEqual({
      focus: true,
      forceRender: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  });

  it('refreshes selection-dependent delete commands after DOM selection import', () => {
    const editor = createTextEditor('abcd', 2);
    const selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    };

    Editor.select(editor, selection);

    applyModelOwnedBeforeInputOperation({
      command: { direction: 'backward', kind: 'delete' },
      data: null,
      deferredOperations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteContentBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(Editor.string(editor, [])).toBe('ad');
  });

  it('ignores native history beforeinput while read-only', () => {
    const editor = createTextEditor('stable', 'stable'.length) as ReactEditor;
    const undo = vi.fn();

    (editor as any).undo = undo;

    const handled = applyModelOwnedNativeHistoryEvent({
      editor,
      event: { inputType: 'historyUndo' } as InputEvent,
      readOnly: true,
    });

    expect(handled).toBe(false);
    expect(undo).not.toHaveBeenCalled();
    expect(Editor.string(editor, [])).toBe('stable');
  });

  it('ignores native history input while read-only', () => {
    const editor = createTextEditor('stable', 'stable'.length) as ReactEditor;
    const undo = vi.fn();

    (editor as any).undo = undo;

    const result = applyEditableInput({
      androidInputManagerRef: { current: null },
      deferredOperations: { current: [] },
      editor,
      event: {
        currentTarget: { textContent: 'stable' },
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { inputType: 'historyUndo' },
      } as any,
      handledDOMBeforeInputRef: { current: false },
      inputController: {} as any,
      readOnly: true,
    });

    expect(result.repairs).toEqual([]);
    expect(undo).not.toHaveBeenCalled();
    expect(Editor.string(editor, [])).toBe('stable');
  });

  it('does not read full editor or DOM text when native input repair already handled the event', () => {
    const handledDOMBeforeInputRef = { current: true };
    const editor = {
      read: vi.fn(() => {
        throw new Error('editor.read should not run');
      }),
    } as unknown as ReactEditor;
    const currentTarget = {
      get textContent() {
        throw new Error('currentTarget.textContent should not run');
      },
    };

    const result = applyEditableInput({
      androidInputManagerRef: { current: null },
      deferredOperations: { current: [] },
      editor,
      event: {
        currentTarget,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: 'x', inputType: 'insertText' },
      } as any,
      handledDOMBeforeInputRef,
      inputController: {} as any,
      readOnly: false,
      skipNativeTextInputRepair: true,
    });

    expect(result.repairs).toEqual([]);
    expect(editor.read).not.toHaveBeenCalled();
    expect(handledDOMBeforeInputRef.current).toBe(false);
  });
});
