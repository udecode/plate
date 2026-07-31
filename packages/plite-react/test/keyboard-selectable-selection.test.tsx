import { act, fireEvent, render } from '@testing-library/react';
import {
  defineEditorSchema,
  type Descendant,
  schema,
  SelectionApi,
} from '@platejs/plite';
import {
  createReactEditor,
  Editable,
  type EditableProps,
  type RenderElementProps,
  Plite,
} from '../src';
import { writeCollapsedModelSelectionDOMPreference } from '../src/editable/model-selection-dom-preference';

class FakeDataTransfer {
  readonly files = [] as unknown as FileList;
  private readonly store = new Map<string, string>();

  getData(type: string) {
    return this.store.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.store.set(type, value);
  }
}

const keyboardSelectableSchema = defineEditorSchema({
  elements: {
    media: {
      content: schema.content.text({ default: 'text', min: 1 }),
      keyboardSelectable: true,
    },
  },
  id: 'keyboard-selectable-selection',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

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
  props: Pick<EditableProps, 'onClick' | 'onMouseUp'> = {}
) => {
  const editor = createReactEditor({
    extensions: [keyboardSelectableSchema],
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

    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
      kind: 'node',
      path: [2],
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

    expect(SelectionApi.isText(captionSelection)).toBe(true);
    expect(captionSelection).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
      kind: 'text',
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

    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
      kind: 'node',
      path: [2],
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
      kind: 'text',
    });
  });

  test('Delete removes the exact node selection and moves to the next text', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();

    await act(async () => {
      const asset = rendered.getByTestId('asset');

      fireEvent.mouseDown(asset);
      fireEvent.mouseUp(asset);
      fireEvent.click(asset);
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
      kind: 'text',
    });
  });

  test('copies and cuts the exact selected owner', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();
    const copyClipboard = new FakeDataTransfer();

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
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
      kind: 'node',
      path: [2],
    });

    const cutClipboard = new FakeDataTransfer();

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
      kind: 'text',
    });
  });

  test('keeps printable input and paste inert until ArrowDown enters text', async () => {
    const { editable, editor, rendered } = renderKeyboardSelectableEditor();
    const clipboard = new FakeDataTransfer();

    clipboard.setData('text/plain', 'paste');
    await selectAsset(rendered);

    await act(async () => {
      expect(fireEvent.keyDown(editable, { key: 'x' })).toBe(false);
    });

    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: 'y',
      inputType: 'insertText',
    });

    await act(async () => {
      editable.dispatchEvent(beforeInput);
      fireEvent.paste(editable, { clipboardData: clipboard });
    });

    expect(beforeInput.defaultPrevented).toBe(true);
    expect(editor.read.value()).toEqual({ children: initialValue() });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
      kind: 'node',
      path: [2],
    });
    expect(document.getSelection()?.rangeCount).toBe(0);
  });
});
