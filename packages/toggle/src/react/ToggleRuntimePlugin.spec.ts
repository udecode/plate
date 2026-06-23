import type { Value } from 'platejs';
import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseTogglePlugin } from '../lib/BaseTogglePlugin';

type ToggleRuntimeApi = {
  isSelectable: (element: unknown) => boolean;
};

type ToggleRuntimeTransforms = {
  deleteBackward: (unit?: 'character') => boolean;
  deleteForward: (unit?: 'character') => boolean;
  insertBreak: () => boolean;
};

const getToggleRuntimeTransforms = (editor: unknown) =>
  getCurrentRuntimeTransforms(editor) as unknown as ToggleRuntimeTransforms;

const createToggleRuntimeEditor = ({
  selection,
  value,
}: {
  selection?: {
    anchor: { offset: number; path: number[] };
    focus: { offset: number; path: number[] };
  };
  value: Value;
}) =>
  createPlateRuntimeEditor({
    initialSelection: selection,
    initialValue: value,
    plugins: [BaseTogglePlugin],
  });

describe('TogglePlugin Slate v2 runtime', () => {
  it('marks children inside closed toggles as not selectable', () => {
    const editor = createToggleRuntimeEditor({
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        { children: [{ text: 'hidden' }], id: 'p1', indent: 1, type: 'p' },
      ],
    });
    const api = editor.api as unknown as ToggleRuntimeApi;
    const hiddenChild = editor.read((state) => state.value.root()[1]);

    expect(api.isSelectable(hiddenChild)).toBe(false);

    editor.api.toggle.toggleIds(['t1'], true);

    expect(api.isSelectable(hiddenChild)).toBe(true);
  });

  it('creates an indented paragraph inside an open toggle on Enter', () => {
    const editor = createToggleRuntimeEditor({
      selection: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    editor.api.toggle.toggleIds(['t1'], true);

    expect(getToggleRuntimeTransforms(editor).insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: '' }],
        indent: 1,
        type: 'p',
      },
      {
        children: [{ text: 'after' }],
        type: 'p',
      },
    ]);
  });

  it('places a new closed-toggle block after hidden children on Enter', () => {
    const editor = createToggleRuntimeEditor({
      selection: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        { children: [{ text: 'hidden' }], id: 'p1', indent: 1, type: 'p' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
    });

    expect(getToggleRuntimeTransforms(editor).insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: 'hidden' }],
        id: 'p1',
        indent: 1,
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'toggle',
      },
      {
        children: [{ text: 'after' }],
        type: 'p',
      },
    ]);
  });

  it('moves across hidden children before deleteBackward without deleting hidden content', () => {
    const editor = createToggleRuntimeEditor({
      selection: {
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
      },
      value: [
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        { children: [{ text: 'hidden' }], id: 'p1', indent: 1, type: 'p' },
        { children: [{ text: 'after' }], id: 'p2', type: 'p' },
      ],
    });

    expect(
      getToggleRuntimeTransforms(editor).deleteBackward('character')
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toMatchObject([
      {
        children: [{ text: 'Toggleafter' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: 'hidden' }],
        id: 'p1',
        indent: 1,
        type: 'p',
      },
    ]);
  });

  it('moves the next selectable block before deleteForward applies', () => {
    const editor = createToggleRuntimeEditor({
      selection: {
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 6, path: [0, 0] },
      },
      value: [
        { children: [{ text: 'before' }], id: 'p0', type: 'p' },
        { children: [{ text: 'Toggle' }], id: 't1', type: 'toggle' },
        { children: [{ text: 'hidden' }], id: 'p1', indent: 1, type: 'p' },
        { children: [{ text: 'after' }], id: 'p2', type: 'p' },
      ],
    });

    expect(
      getToggleRuntimeTransforms(editor).deleteForward('character')
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toMatchObject([
      {
        children: [{ text: 'beforeToggle' }],
        id: 'p0',
        type: 'p',
      },
      {
        children: [{ text: 'hidden' }],
        id: 'p1',
        indent: 1,
        type: 'p',
      },
      {
        children: [{ text: 'after' }],
        id: 'p2',
        type: 'p',
      },
    ]);
  });
});
