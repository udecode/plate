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

  it('is a no-op when no matching placeholder history batch exists', () => {
    const editors = [
      {
        history: {
          undos: [],
        },
      },
      {
        history: {
          undos: [
            {
              [KEYS.placeholder]: true,
              operations: [
                {
                  node: { id: 'other-placeholder' },
                  type: 'insert_node',
                },
              ],
            },
          ],
        },
      },
    ] as any[];

    for (const editor of editors) {
      expect(() =>
        updateUploadHistory(editor, {
          id: 'media-1',
          placeholderId: 'placeholder-1',
          type: 'img',
        } as any)
      ).not.toThrow();
    }

    expect(editors[0].history.undos).toEqual([]);
    expect(editors[1].history.undos[0].operations[0].node).toEqual({
      id: 'other-placeholder',
    });
  });
});
