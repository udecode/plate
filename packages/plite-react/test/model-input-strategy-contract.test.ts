import { createEditor, defineExtension, editorCommands } from '@platejs/plite';
import { IS_COMPOSING } from '@platejs/plite-dom/internal';
import {
  getChildren as editorGetChildren,
  getSelection as editorGetSelection,
  replace as editorReplace,
  select as editorSelect,
  string as editorString,
} from '@platejs/plite/internal';
import { describe, expect, it, vi } from 'vitest';

import type { ReactEditor } from '../src';
import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-state';
import {
  applyEditableInput,
  applyModelOwnedBeforeInputMutation,
  applyModelOwnedNativeHistoryEvent,
} from '../src/editable/model-input-strategy';
import { applyModelOwnedDataTransferInput } from '../src/editable/mutation-controller';

const createTextEditor = (text = '', offset = 0, type = 'paragraph') => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [{ type, children: [{ text }] }],
    selection: {
      kind: 'text',
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

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: firstText }] },
      { type: 'paragraph', children: [{ text: secondText }] },
    ],
    selection: {
      kind: 'text',
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
      dom: {
        clipboard: {
          insertData(receivedData: DataTransfer) {
            insertCount += 1;
            expect(receivedData).toBe(data);

            return true;
          },
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
      dom: {
        clipboard: {
          insertData(receivedData: DataTransfer) {
            insertCount += 1;
            expect(receivedData).toBe(data);

            return true;
          },
        },
      },
    };

    expect(
      applyModelOwnedBeforeInputMutation({
        command: {
          data,
          kind: 'insert-data',
        },
        data,
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertFromPaste',
        native: false,
        selection: editorGetSelection(editor),
        setComposing: () => {},
      })
    ).toEqual({ kind: 'repair-caret' });
    expect(insertCount).toBe(1);
  });

  it('executes the prepared beforeinput command instead of reparsing event data', () => {
    const editor = createTextEditor();

    applyModelOwnedBeforeInputMutation({
      command: {
        inputType: 'insertText',
        kind: 'insert-text',
        text: 'kernel',
      },
      data: 'event',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('kernel');
  });

  it('uses the synced collapsed selection for model-owned insertText', () => {
    const editor = createTextEditor('abcd', 2);
    const selection = editorGetSelection(editor);

    applyModelOwnedBeforeInputMutation({
      command: {
        inputType: 'insertText',
        kind: 'insert-text',
        text: '!',
      },
      data: '!',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('ab!cd');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  it('uses the direct collapsed insert path for empty marks', () => {
    const editor = createTextEditor('abcd', 2);
    const events: Array<{ id: string; kind: string }> = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__PLITE_REACT_RENDER_PROFILER__;

    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputMutation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: '!',
        },
        data: '!',
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: editorGetSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __PLITE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(editorString(editor, [])).toBe('ab!cd');
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
    const events: Array<{ id: string; kind: string }> = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__PLITE_REACT_RENDER_PROFILER__;

    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputMutation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: 'a',
        },
        data: 'a',
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: editorGetSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __PLITE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(editorString(editor, [])).toBe('a');
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
    const events: Array<{ id: string; kind: string }> = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__PLITE_REACT_RENDER_PROFILER__;

    editorReplace(editor, {
      children: [
        {
          type: 'quote',
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      },
    });

    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputMutation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: 'a',
        },
        data: 'a',
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: editorGetSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __PLITE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(editorString(editor, [])).toBe('a');
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
      marks: {},
    };
    const events: Array<{ id: string; kind: string }> = [];
    const previousProfiler = (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__PLITE_REACT_RENDER_PROFILER__;

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Bold', bold: true }],
        },
      ],
      selection,
    });

    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record: (event: { id: string; kind: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record: (event) => events.push(event),
    };

    try {
      applyModelOwnedBeforeInputMutation({
        command: {
          inputType: 'insertText',
          kind: 'insert-text',
          text: ' Plain',
        },
        data: ' Plain',
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertText',
        native: false,
        selection: editorGetSelection(editor),
        setComposing: () => {},
      });
    } finally {
      (
        globalThis as typeof globalThis & {
          __PLITE_REACT_RENDER_PROFILER__?: unknown;
        }
      ).__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    expect(editorGetChildren(editor)).toEqual([
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    };

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
      selection,
    });

    applyModelOwnedBeforeInputMutation({
      command: {
        inputType: 'insertText',
        kind: 'insert-text',
        text: 'X',
      },
      data: 'X',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('X');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  it('routes model-owned insertText through command handlers', () => {
    const editor = createTextEditor('-', 1);

    editor.install(
      defineExtension('markdown-shortcut-command', {
        commands: ({ handle }) => [
          handle(editorCommands.insertText, ({ input, state }) => {
            if (input.text !== ' ') return false;

            return state.transaction((tx) => {
              tx.selection.set({
                kind: 'text',
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [0, 0], offset: 1 },
              });
              tx.text.delete();
              tx.nodes.set({ type: 'list-item' });
            });
          }),
        ],
      })
    );

    applyModelOwnedBeforeInputMutation({
      data: ' ',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: editorGetSelection(editor),
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 'alpha '.length },
      focus: { path: [0, 0], offset: 'alpha beta'.length },
    };

    editorSelect(editor, selection);

    const repair = applyModelOwnedBeforeInputMutation({
      data: 'omega',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('alpha omega');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 'alpha omega'.length },
      focus: { path: [0, 0], offset: 'alpha omega'.length },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('replaces an autocorrect prefix without appending after it', () => {
    const editor = createTextEditor('i', 1);
    const insertSelection = editorGetSelection(editor);

    applyModelOwnedBeforeInputMutation({
      data: 'S',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: insertSelection,
      setComposing: () => {},
    });

    const replacementSelection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };

    editorSelect(editor, replacementSelection);

    const repair = applyModelOwnedBeforeInputMutation({
      data: 'I',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection: replacementSelection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('IS');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('uses the provided replacement target after native text repair moves selection', () => {
    const editor = createTextEditor('iS', 2);
    const replacementSelection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };

    const repair = applyModelOwnedBeforeInputMutation({
      data: 'I',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection: replacementSelection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('IS');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('transposes adjacent characters from insertTranspose beforeinput', () => {
    const editor = createTextEditor('abc', 1);

    const firstRepair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertTranspose',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('bac');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
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

    const secondRepair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertTranspose',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('bca');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    expect(secondRepair).toEqual(firstRepair);
  });

  it('splits a custom block on Enter without dropping follow-up text', () => {
    const editor = createTextEditor('Heading', 'Heading'.length, 'heading-one');
    const selection = editorGetSelection(editor);

    const repair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertParagraph',
      native: false,
      selection,
      setComposing: () => {},
    });

    const [heading, paragraph] = editorGetChildren(editor) as any[];

    expect(heading.type).toBe('heading-one');
    expect(editorString(editor, [0])).toBe('Heading');
    expect(paragraph.type).toBe('heading-one');
    expect(editorString(editor, [1])).toBe('');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
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

    applyModelOwnedBeforeInputMutation({
      data: 'A',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    expect(editorString(editor, [1])).toBe('A');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  it('routes Android-style first-line autocorrect through empty-state replacement text', () => {
    const editor = createTextEditor();
    const selection = editorGetSelection(editor);

    const repair = applyModelOwnedBeforeInputMutation({
      data: 'hello',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertReplacementText',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('hello');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 'hello'.length },
      focus: { path: [0, 0], offset: 'hello'.length },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('keeps Android-style newline after composition from swallowing follow-up text', () => {
    const editor = createTextEditor();

    applyModelOwnedBeforeInputMutation({
      data: 'hello',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertFromComposition',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    expect(editorString(editor, [0])).toBe('hello');

    applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertParagraph',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    const [first, second] = editorGetChildren(editor) as any[];

    expect(first.type).toBe('paragraph');
    expect(second.type).toBe('paragraph');
    expect(editorString(editor, [0])).toBe('hello');
    expect(editorString(editor, [1])).toBe('');

    applyModelOwnedBeforeInputMutation({
      data: 'world',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertText',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    expect(editorString(editor, [1])).toBe('world');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [1, 0], offset: 'world'.length },
      focus: { path: [1, 0], offset: 'world'.length },
    });
  });

  it('routes Android-style backspace through model-owned beforeinput', () => {
    const editor = createTextEditor('abcd', 2);
    const selection = editorGetSelection(editor);

    const repair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteContentBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('acd');
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

  it.each(['deleteByCut', 'deleteByDrag'] as const)(
    'deletes the selected fragment from %s beforeinput',
    (inputType) => {
      const editor = createEditor();

      editorReplace(editor, {
        children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 3 },
        },
      });

      const repair = applyModelOwnedBeforeInputMutation({
        data: null,
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType,
        native: false,
        selection: editorGetSelection(editor),
        setComposing: () => {},
      });

      expect(editorString(editor, [])).toBe('ad');
      expect(editorGetSelection(editor)).toEqual({
        kind: 'text',
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
    }
  );

  it('deletes the current hard line backward without touching the previous block', () => {
    const editor = createTwoBlockTextEditor('foobar', 'baz');
    const selection = editorGetSelection(editor);

    const repair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteHardLineBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [0])).toBe('foobar');
    expect(editorString(editor, [1])).toBe('');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
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

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'foobar' }] },
        { type: 'paragraph', children: [{ text: 'baz' }] },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 'foo'.length },
        focus: { path: [0, 0], offset: 'foo'.length },
      },
    });

    const repair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteSoftLineForward',
      native: false,
      selection: editorGetSelection(editor),
      setComposing: () => {},
    });

    expect(editorString(editor, [0])).toBe('foo');
    expect(editorString(editor, [1])).toBe('baz');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
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
    const selection = editorGetSelection(editor);

    const repair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteContentBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 'prefix '.length },
      focus: { path: [0, 0], offset: 'prefix stale'.length },
    };

    editorSelect(editor, selection);

    const repair = applyModelOwnedBeforeInputMutation({
      data: '中文',
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'insertFromComposition',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('prefix 中文 suffix');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 'prefix 中文'.length },
      focus: { path: [0, 0], offset: 'prefix 中文'.length },
    });
    expect(repair).toEqual({ kind: 'none' });
  });

  it('keeps composing when compositionend precedes insertFromComposition', () => {
    const editor = createTextEditor('prefix stale suffix');
    const selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'prefix '.length },
      focus: { path: [0, 0], offset: 'prefix stale'.length },
    };
    const setComposing = vi.fn((nextValue: boolean) => {
      IS_COMPOSING.set(editor, nextValue);
    });

    editorSelect(editor, selection);
    IS_COMPOSING.set(editor, true);

    try {
      applyModelOwnedBeforeInputMutation({
        data: '中文',
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertFromComposition',
        native: false,
        preserveComposing: true,
        selection,
        setComposing,
      });

      expect(editorString(editor, [])).toBe('prefix 中文 suffix');
      expect(setComposing).not.toHaveBeenCalled();
      expect(IS_COMPOSING.get(editor)).toBe(true);
    } finally {
      IS_COMPOSING.delete(editor);
    }
  });

  it('clears composing when insertFromComposition precedes compositionend', () => {
    const editor = createTextEditor('prefix stale suffix');
    const selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 'prefix '.length },
      focus: { path: [0, 0], offset: 'prefix stale'.length },
    };
    const setComposing = vi.fn((nextValue: boolean) => {
      IS_COMPOSING.set(editor, nextValue);
    });

    editorSelect(editor, selection);
    IS_COMPOSING.set(editor, true);

    try {
      applyModelOwnedBeforeInputMutation({
        data: '中文',
        deferredMutations: { current: [] },
        editor: editor as ReactEditor,
        inputType: 'insertFromComposition',
        native: false,
        selection,
        setComposing,
      });

      expect(editorString(editor, [])).toBe('prefix 中文 suffix');
      expect(setComposing).toHaveBeenCalledOnce();
      expect(setComposing).toHaveBeenCalledWith(false);
      expect(IS_COMPOSING.get(editor)).toBe(false);
    } finally {
      IS_COMPOSING.delete(editor);
    }
  });

  it('deletes expanded CJK composition selection once', () => {
    const editor = createTextEditor('中文');
    const selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    };

    editorSelect(editor, selection);

    const repair = applyModelOwnedBeforeInputMutation({
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteByComposition',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('中');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
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
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    };

    editorSelect(editor, selection);

    applyModelOwnedBeforeInputMutation({
      command: { direction: 'backward', kind: 'delete' },
      data: null,
      deferredMutations: { current: [] },
      editor: editor as ReactEditor,
      inputType: 'deleteContentBackward',
      native: false,
      selection,
      setComposing: () => {},
    });

    expect(editorString(editor, [])).toBe('ad');
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
    expect(editorString(editor, [])).toBe('stable');
  });

  it('ignores native history input while read-only', () => {
    const editor = createTextEditor('stable', 'stable'.length) as ReactEditor;
    const undo = vi.fn();

    (editor as any).undo = undo;

    const result = applyEditableInput({
      androidInputManagerRef: { current: null },
      deferredMutations: { current: [] },
      editor,
      event: {
        currentTarget: { textContent: 'stable' },
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { inputType: 'historyUndo' },
      } as any,
      handledDOMBeforeInputRef: { current: false },
      inputController: createEditableInputController({
        preferModelSelectionForInputRef: { current: false },
        state: createEditableInputControllerState(),
      }),
      readOnly: true,
    });

    expect(result.repairs).toEqual([]);
    expect(undo).not.toHaveBeenCalled();
    expect(editorString(editor, [])).toBe('stable');
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
      deferredMutations: { current: [] },
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
