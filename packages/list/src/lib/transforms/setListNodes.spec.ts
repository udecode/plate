import { KEYS, createBasePlateEditor } from 'platejs';

import { setListNodes } from './setListNodes';

describe('setListNodes', () => {
  it('increments indent for non-list blocks before applying list metadata', () => {
    const editor = createBasePlateEditor({
      value: [{ [KEYS.indent]: 1, children: [{ text: 'Item' }], type: KEYS.p }],
    });

    setListNodes(editor, [[editor.children[0], [0]]] as any, {
      listStyleType: 'decimal',
    });

    expect(editor.children[0]).toMatchObject({
      [KEYS.indent]: 2,
      [KEYS.listType]: 'decimal',
      type: KEYS.p,
    });
  });

  it('uses todo helpers when the target style is todo', () => {
    const editor = createBasePlateEditor({
      value: [
        {
          [KEYS.indent]: 3,
          [KEYS.listChecked]: true,
          children: [{ text: 'Todo' }],
          type: KEYS.p,
        },
      ],
    });

    setListNodes(editor, [[editor.children[0], [0]]] as any, {
      listStyleType: 'todo',
    });

    expect(editor.children[0]).toMatchObject({
      [KEYS.indent]: 3,
      [KEYS.listChecked]: false,
      [KEYS.listType]: 'todo',
      type: KEYS.p,
    });
  });
});
