import { KEYS, createSlateEditor } from 'platejs';

import * as outdentListModule from './outdentList';
import { toggleListUnset } from './toggleListUnset';

describe('toggleListUnset', () => {
  afterEach(() => {
    mock.restore();
  });

  it('unsets todo-list state and outdents todo items', () => {
    const outdentSpy = spyOn(
      outdentListModule,
      'outdentList'
    ).mockImplementation(() => {});
    const editor = createSlateEditor({
      value: [
        {
          [KEYS.listChecked]: false,
          children: [{ text: 'Todo' }],
          type: KEYS.p,
        },
      ],
    });

    expect(
      toggleListUnset(editor, [editor.children[0], [0]] as any, {
        listStyleType: KEYS.listTodo,
      })
    ).toBe(true);

    expect(editor.children[0]).not.toHaveProperty(KEYS.listChecked);
    expect(outdentSpy).toHaveBeenCalledWith(editor, {
      listStyleType: KEYS.listTodo,
    });
  });

  it('unsets matching listStyleType metadata and outdents the item', () => {
    const outdentSpy = spyOn(
      outdentListModule,
      'outdentList'
    ).mockImplementation(() => {});
    const editor = createSlateEditor({
      value: [
        { [KEYS.listType]: 'disc', children: [{ text: 'Item' }], type: KEYS.p },
      ],
    });

    expect(
      toggleListUnset(editor, [editor.children[0], [0]] as any, {
        listStyleType: 'disc',
      })
    ).toBe(true);

    expect(editor.children[0]).not.toHaveProperty(KEYS.listType);
    expect(outdentSpy).toHaveBeenCalledWith(editor, {
      listStyleType: 'disc',
    });
  });

  it('does nothing when the requested list style does not match', () => {
    const outdentSpy = spyOn(
      outdentListModule,
      'outdentList'
    ).mockImplementation(() => {});
    const editor = createSlateEditor({
      value: [
        {
          [KEYS.listType]: 'circle',
          children: [{ text: 'Item' }],
          type: KEYS.p,
        },
      ],
    });

    expect(
      toggleListUnset(editor, [editor.children[0], [0]] as any, {
        listStyleType: 'disc',
      })
    ).toBeUndefined();

    expect(editor.children[0]).toHaveProperty(KEYS.listType, 'circle');
    expect(outdentSpy).not.toHaveBeenCalled();
  });
});
