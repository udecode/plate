import { KEYS } from 'platejs';

import {
  isHistoryMarking,
  updateUploadHistory,
  withHistoryMark,
} from './history';

describe('placeholder upload history', () => {
  it('marks history only for the wrapped callback lifetime', () => {
    const editor = {} as any;

    expect(isHistoryMarking(editor)).toBe(false);

    withHistoryMark(editor, () => {
      expect(isHistoryMarking(editor)).toBe(true);
    });

    expect(isHistoryMarking(editor)).toBe(false);
  });

  it('rewrites placeholder insert history with the uploaded node payload', () => {
    const editor = {
      history: {
        undos: [
          {
            [KEYS.placeholder]: true,
            operations: [
              {
                node: { id: 'placeholder-1' },
                type: 'insert_node',
              },
            ],
          },
        ],
      },
    } as any;

    updateUploadHistory(editor, {
      id: 'media-1',
      placeholderId: 'placeholder-1',
      type: 'img',
    } as any);

    expect(editor.history.undos[0].operations[0].node).toEqual({
      id: 'media-1',
      placeholderId: 'placeholder-1',
      type: 'img',
    });
  });
});
