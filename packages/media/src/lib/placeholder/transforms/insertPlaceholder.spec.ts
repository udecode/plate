import { KEYS } from 'platejs';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertPlaceholder,
  insertVideoPlaceholder,
} from './insertPlaceholder';

describe('insertPlaceholder', () => {
  it('wraps placeholder insertion in withoutNormalizing', () => {
    const insertNodes = mock();
    const withoutNormalizing = mock((fn: () => void) => fn());
    const editor = {
      getType: (key: string) => key,
      tf: {
        insertNodes,
        withoutNormalizing,
      },
    } as any;

    insertPlaceholder(editor, KEYS.img, { at: [0] });

    expect(withoutNormalizing).toHaveBeenCalledTimes(1);
    expect(insertNodes).toHaveBeenCalledWith(
      {
        children: [{ text: '' }],
        mediaType: KEYS.img,
        type: KEYS.placeholder,
      },
      { at: [0] }
    );
  });

  it('uses the expected media type helpers', () => {
    const insertNodes = mock();
    const editor = {
      getType: (key: string) => key,
      tf: {
        insertNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    insertImagePlaceholder(editor);
    insertVideoPlaceholder(editor);
    insertAudioPlaceholder(editor);
    insertFilePlaceholder(editor);

    expect(insertNodes.mock.calls.map((call) => call[0].mediaType)).toEqual([
      KEYS.img,
      KEYS.video,
      KEYS.audio,
      KEYS.file,
    ]);
  });
});
