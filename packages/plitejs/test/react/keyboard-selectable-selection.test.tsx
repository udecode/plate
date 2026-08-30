import { act, fireEvent, render } from '@testing-library/react';
import {
  defineEditorSchema,
  type Descendant,
  schema,
  SelectionApi,
} from 'plitejs';
import { history } from 'plitejs/history';
import { createDataTransfer } from 'plitejs/testing';

import { getEditorLiveSelection } from '../../src/internal';
import {
  createEditor,
  Editable,
  type EditableProps,
  type RenderElementProps,
  Plite,
} from '../../src/react';
import { writeCollapsedModelSelectionDOMPreference } from '../../src/react/editable/model-selection-dom-preference';

const keyboardSelectableSchema = defineEditorSchema(
  'schema:keyboard-selectable-selection',
  {
    elements: {
      media: {
        content: schema.content.text({ default: 'text', min: 1 }),
        keyboardSelectable: true,
      },
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'keyboard-selectable-selection',
    root: schema.content.types(['media', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  }
);

const initialValue = (): Descendant[] => [
  { type: 'paragraph', children: [{ text: 'start' }] },
  { type: 'paragraph', children: [{ text: 'before' }] },
  { type: 'media', children: [{ text: 'caption' }] },
  { type: 'paragraph', children: [{ text: 'after' }] },
];

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) =>
  element.type === 'media' ? (
    <figure {...attributes}>
      <div contentEditable={false} data-testid="asset">
        asset
      </div>
      <figcaption>{children}</figcaption>
    </figure>
  ) : (
    <p {...attributes}>{children}</p>
  );

const renderKeyboardSelectableEditor = (
  props: Pick<EditableProps, 'onClick' | 'onMouseUp'> = {},
  options: { history?: boolean } = {}
) => {
  const editor = createEditor({
    extensions: [
      ...(options.history ? [history()] : []),
      keyboardSelectableSchema,
    ],
    initialValue: initialValue(),
  });
  const rendered = render(
    <Plite editor={editor}>
      <Editable {...props} renderElement={renderElement} />
    </Plite>
  );
  const editable = rendered.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  );

  expect(editable).toBeTruthy();
  Object.defineProperty(editable!, 'isContentEditable', {
    configurable: true,
    value: true,
  });

  return { editable: editable!, editor, rendered };
};

const selectAsset = async (
  rendered: ReturnType<typeof renderKeyboardSelectableEditor>['rendered']
) => {
  const asset = rendered.getByTestId('asset');

  await act(async () => {
    fireEvent.mouseDown(asset);
    fireEvent.mouseUp(asset);
    fireEvent.click(asset);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
};

describe('keyboard-selectable element selection', () => {
  test('keeps node focus DOM-less and moves between owner and direct text', async () => {
    const writeStaleDOMSelection = () => {
      const text = document.querySelector<HTMLElement>(
        '[data-plite-path="0,0"] [data-plite-string]'
      )?.firstChild;

      expect(text).toBeTruthy();
      document.getSelection()?.setBaseAndExtent(text!, 0, text!, 0);
    };
    const { editable, editor, rendered } = renderKeyboardSelectableEditor({
      onClick: writeStaleDOMSelection,
      onMouseUp: writeStaleDOMSelection,
    });
    const asset = rendered.getByTestId('asset');

    await act(async () => {
      fireEvent.mouseDown(asset);
      fireEvent.mouseUp(asset);
      fireEvent.click(asset);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });
    expect(document.activeElement).toBe(editable);
    expect(document.getSelection()?.rangeCount).toBe(0);

    const staleDOMPoint = rendered.container.querySelector<HTMLElement>(
      '[data-plite-path="1,0"] [data-plite-string]'
    )?.firstChild;

    expect(staleDOMPoint).toBeTruthy();
    writeCollapsedModelSelectionDOMPreference(
      editor,
      SelectionApi.text({
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
      }),
      { node: staleDOMPoint!, offset: 0 }
    );

    await act(async () => {
      document
        .getSelection()
        ?.setBaseAndExtent(staleDOMPoint!, 0, staleDOMPoint!, 0);
      fireEvent.keyDown(editable, { key: 'ArrowDown' });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    const captionSelection = editor.read((state) => state.selection());

    expect(captionSelection).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
    });
    expect(
      document
        .getSelection()
        ?.anchorNode?.parentElement?.closest('[data-plite-path]')
        ?.getAttribute('data-plite-path')
    ).toBe('2,0');

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'ArrowUp' });
    });

    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });
    expect(document.activeElement).toBe(editable);
    expect(document.getSelection()?.rangeCount).toBe(0);

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'Backspace' });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 6, path: [1, 0] },
      focus: { offset: 6, path: [1, 0] },
    });
  });

  test('Delete removes the exact node selection and moves to the next text', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();

    await selectAsset(rendered);

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'Delete' });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
    });
  });

  test('Enter preserves a node selection with no aggregate break target', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();

    await selectAsset(rendered);

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'Enter' });
    });

    expect(editor.read.value()).toEqual({ children: initialValue() });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });
  });

  test('copies and cuts the exact selected owner', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();
    const copyClipboard = createDataTransfer();

    await selectAsset(rendered);

    await act(async () => {
      fireEvent.copy(editable, { clipboardData: copyClipboard });
    });

    const encoded = copyClipboard.getData('application/x-plite-fragment');

    expect(encoded).not.toBe('');
    expect(JSON.parse(decodeURIComponent(atob(encoded)))).toEqual({
      slice: {
        content: [{ type: 'media', children: [{ text: 'caption' }] }],
        openEnd: 0,
        openStart: 0,
      },
      version: 1,
    });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });

    const cutClipboard = createDataTransfer();

    await act(async () => {
      fireEvent.cut(editable, { clipboardData: cutClipboard });
    });

    expect(
      JSON.parse(
        decodeURIComponent(
          atob(cutClipboard.getData('application/x-plite-fragment'))
        )
      )
    ).toEqual({
      slice: {
        content: [{ type: 'media', children: [{ text: 'caption' }] }],
        openEnd: 0,
        openStart: 0,
      },
      version: 1,
    });
    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 6, path: [1, 0] },
      focus: { offset: 6, path: [1, 0] },
    });
  });

  test('printable input replaces the exact selected owner', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();

    await selectAsset(rendered);

    await act(async () => {
      expect(fireEvent.keyDown(editable, { key: 'x' })).toBe(false);
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'x' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 1, path: [2, 0] },
      focus: { offset: 1, path: [2, 0] },
    });
  });

  test('undo restores the exact directional node selection after printable replacement', async () => {
    const { editable, editor } = renderKeyboardSelectableEditor(
      {},
      { history: true }
    );

    editor.update.selection.setNodes([[1], [2]], { anchor: [1], focus: [2] });

    await act(async () => {
      expect(fireEvent.keyDown(editable, { key: 'x' })).toBe(false);
    });

    await act(async () => {
      fireEvent.keyDown(editable, {
        code: 'KeyZ',
        ctrlKey: true,
        key: 'z',
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(editor.read.value()).toEqual({ children: initialValue() });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [1],
      focusPath: [2],
      kind: 'node',
      paths: [[1], [2]],
    });
  });

  test('beforeinput replaces a model-only node selection', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();

    await selectAsset(rendered);

    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: 'y',
      inputType: 'insertText',
    });

    expect(SelectionApi.isNode(getEditorLiveSelection(editor))).toBe(true);

    await act(async () => {
      editable.dispatchEvent(beforeInput);
    });

    expect(beforeInput.defaultPrevented).toBe(true);
    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'y' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 1, path: [2, 0] },
      focus: { offset: 1, path: [2, 0] },
    });
  });

  test('paste replaces the exact selected owner', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();
    const clipboard = createDataTransfer();

    clipboard.setData('text/plain', 'paste');
    await selectAsset(rendered);

    await act(async () => {
      fireEvent.paste(editable, { clipboardData: clipboard });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'paste' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 5, path: [2, 0] },
      focus: { offset: 5, path: [2, 0] },
    });
  });

  test('routes body-targeted paste to the focused node selection', async () => {
    const { editor, rendered } = renderKeyboardSelectableEditor();
    const clipboard = createDataTransfer();

    clipboard.setData('text/plain', 'paste');
    await selectAsset(rendered);

    await act(async () => {
      fireEvent.paste(document.body, { clipboardData: clipboard });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'paste' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 5, path: [2, 0] },
      focus: { offset: 5, path: [2, 0] },
    });
  });
});
