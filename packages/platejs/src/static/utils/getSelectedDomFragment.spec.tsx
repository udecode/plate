import { createEditor } from '../../lib/editor';
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
    const editor = createEditor();
    const block = {
      children: [{ text: 'hello' }],
      type: 'paragraph',
    };

    editor.update.value.replace({ children: [block], selection: null });
    document.body.innerHTML =
      '<div data-plite-node="element" data-plite-path="0" data-plite-root="main">hello</div>';
    const blockElement = document.querySelector(
      '[data-plite-node="element"][data-plite-path]'
    ) as HTMLElement;
    const range = document.createRange();
    const selection = window.getSelection()!;

    range.selectNode(blockElement);
    selection.removeAllRanges();
    selection.addRange(range);

    expect(getSelectedDomFragment(editor)).toEqual([block]);
  });

  it('deserializes partial edge blocks for non-void selections', () => {
    const editor = createEditor();
    const blockOne = { children: [{ text: 'hello world' }], type: 'paragraph' };
    const blockTwo = { children: [{ text: 'omega' }], type: 'paragraph' };
    const partialOne = {
      children: [{ text: 'ello world' }],
      type: 'paragraph',
    };

    editor.update.value.replace({
      children: [blockOne, blockTwo],
      selection: null,
    });
    document.body.innerHTML = [
      '<div data-plite-node="element" data-plite-path="0" data-plite-root="main">hello world</div>',
      '<div data-plite-node="element" data-plite-path="1" data-plite-root="main">omega</div>',
    ].join('');

    selectText(
      document.querySelector('[data-plite-path="0"]')!.firstChild as Text,
      1,
      5
    );
    window
      .getSelection()!
      .getRangeAt(0)
      .setEnd(
        document.querySelector('[data-plite-path="1"]')!.firstChild as Text,
        5
      );

    expect(getSelectedDomFragment(editor)).toEqual([partialOne, blockTwo]);
  });
});
