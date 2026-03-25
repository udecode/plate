import { createSlateEditor } from '../../lib/editor';
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
      '<div data-slate-id="block-1" data-slate-node="element">hello</div>';
    const blockElement = document.querySelector(
      '[data-slate-id="block-1"]'
    ) as HTMLElement;
    const range = document.createRange();
    const selection = window.getSelection()!;

    range.selectNode(blockElement);
    selection.removeAllRanges();
    selection.addRange(range);

    const editor = createSlateEditor();
    const block = { children: [{ text: 'hello' }], type: 'p' };

    editor.api.node = mock().mockReturnValue([block, [0]]) as any;
    editor.api.isVoid = mock().mockReturnValue(false) as any;
    editor.api.html.deserialize = mock() as any;

    expect(getSelectedDomFragment(editor)).toEqual([block]);
    expect(editor.api.html.deserialize).not.toHaveBeenCalled();
  });

  it('deserializes partial edge blocks for non-void selections', () => {
    document.body.innerHTML = [
      '<div data-slate-id="block-1" data-slate-node="element">hello world</div>',
      '<div data-slate-id="block-2" data-slate-node="element">omega</div>',
    ].join('');

    selectText(
      document.querySelector('[data-slate-id="block-1"]')!.firstChild as Text,
      1,
      5
    );
    window
      .getSelection()!
      .getRangeAt(0)
      .setEnd(
        document.querySelector('[data-slate-id="block-2"]')!.firstChild as Text,
        5
      );

    const editor = createSlateEditor();
    const blockOne = { children: [{ text: 'hello world' }], type: 'p' };
    const blockTwo = { children: [{ text: 'omega' }], type: 'p' };
    const partialOne = { children: [{ text: 'ello world' }], type: 'p' };

    editor.api.node = mock(({ id }) => {
      if (id === 'block-1') return [blockOne, [0]];
      if (id === 'block-2') return [blockTwo, [1]];
    }) as any;
    editor.api.isVoid = mock().mockReturnValue(false) as any;
    editor.api.html.deserialize = mock().mockReturnValue([partialOne]) as any;

    expect(getSelectedDomFragment(editor)).toEqual([partialOne, blockTwo]);
    expect(editor.api.html.deserialize).toHaveBeenCalledTimes(1);
  });
});
