import { createBaseEditor } from '../../lib/editor';
import { getSelectedDomFragment } from './getSelectedDomFragment';

const selectText = (node: Text, start: number, end: number) => {
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);

  const selection = window.getSelection()!;

  selection.removeAllRanges();
  selection.addRange(range);
};

describe('getSelectedDomFragment', () => {
  afterEach(() => {
    window.getSelection()?.removeAllRanges();
    document.body.innerHTML = '';
  });

  it('returns fully selected top-level blocks without deserializing them again', () => {
    document.body.innerHTML =
      '<div data-plite-id="block-1" data-plite-node="element">hello</div>';
    const blockElement = document.querySelector(
      '[data-plite-id="block-1"]'
    ) as HTMLElement;
    const range = document.createRange();
    const selection = window.getSelection()!;

    range.selectNode(blockElement);
    selection.removeAllRanges();
    selection.addRange(range);

    const editor = createBaseEditor({
      nodeId: true,
    });
    const block = { children: [{ text: 'hello' }], id: 'block-1', type: 'p' };

    editor.update.value.replace({ children: [block], selection: null });

    expect(getSelectedDomFragment(editor)).toEqual([block]);
  });

  it('deserializes partial edge blocks for non-void selections', () => {
    document.body.innerHTML = [
      '<div data-plite-id="block-1" data-plite-node="element">hello world</div>',
      '<div data-plite-id="block-2" data-plite-node="element">omega</div>',
    ].join('');

    selectText(
      document.querySelector('[data-plite-id="block-1"]')!.firstChild as Text,
      1,
      5
    );
    window
      .getSelection()!
      .getRangeAt(0)
      .setEnd(
        document.querySelector('[data-plite-id="block-2"]')!.firstChild as Text,
        5
      );

    const editor = createBaseEditor({
      nodeId: true,
    });
    const blockOne = { children: [{ text: 'hello world' }], type: 'p' };
    const blockTwo = { children: [{ text: 'omega' }], type: 'p' };
    const partialOne = { children: [{ text: 'ello world' }], type: 'p' };

    editor.update.value.replace({
      children: [
        { ...blockOne, id: 'block-1' },
        { ...blockTwo, id: 'block-2' },
      ],
      selection: null,
    });

    expect(getSelectedDomFragment(editor)).toEqual([
      partialOne,
      { ...blockTwo, id: 'block-2' },
    ]);
  });
});
