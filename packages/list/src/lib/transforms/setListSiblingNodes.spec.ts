import { KEYS, createBasePlateEditor } from 'platejs';

import * as getListSiblingsModule from '../queries/getListSiblings';
import { setListSiblingNodes } from './setListSiblingNodes';

describe('setListSiblingNodes', () => {
  afterEach(() => {
    mock.restore();
  });

  it('retypes sibling list items and clears todo metadata', () => {
    const editor = createBasePlateEditor({
      value: [
        { [KEYS.indent]: 2, children: [{ text: 'One' }], type: KEYS.p },
        { [KEYS.indent]: 3, children: [{ text: 'Two' }], type: KEYS.p },
      ],
    });
    const getListSiblingsSpy = spyOn(
      getListSiblingsModule,
      'getListSiblings'
    ).mockReturnValue([
      [editor.children[0], [0]],
      [editor.children[1], [1]],
    ] as any);

    setListSiblingNodes(editor, [{ type: KEYS.p }, [0]] as any, {
      getSiblingListOptions: { breakOnEqIndentNeqListStyleType: false } as any,
      listStyleType: 'decimal',
    });

    expect(getListSiblingsSpy).toHaveBeenCalled();
    expect(editor.children).toMatchObject([
      { [KEYS.indent]: 2, [KEYS.listType]: 'decimal' },
      { [KEYS.indent]: 3, [KEYS.listType]: 'decimal' },
    ]);
  });

  it('uses todo helpers when retyping sibling todo items', () => {
    const editor = createBasePlateEditor({
      value: [{ [KEYS.indent]: 4, children: [{ text: 'Todo' }], type: KEYS.p }],
    });
    spyOn(getListSiblingsModule, 'getListSiblings').mockReturnValue([
      [editor.children[0], [0]],
    ] as any);

    setListSiblingNodes(editor, [{ type: KEYS.p }, [0]] as any, {
      listStyleType: KEYS.listTodo,
    });

    expect(editor.children[0]).toMatchObject({
      [KEYS.indent]: 4,
      [KEYS.listChecked]: false,
      [KEYS.listType]: KEYS.listTodo,
    });
  });
});
