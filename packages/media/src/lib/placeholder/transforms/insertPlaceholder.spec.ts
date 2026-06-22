import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import {
  insertAudioPlaceholder,
  insertFilePlaceholder,
  insertImagePlaceholder,
  insertPlaceholder,
  insertVideoPlaceholder,
} from './insertPlaceholder';

const asPlaceholderEditor = (editor: {
  getType: (key: string) => string;
  tf: {
    insertNodes: ReturnType<typeof mock>;
    withoutNormalizing: (fn: () => void) => void;
  };
}) => editor as unknown as SlateEditor;

describe('insertPlaceholder', () => {
  it('wraps placeholder insertion in withoutNormalizing', () => {
    const insertNodes = mock();
    let withoutNormalizingCalls = 0;
    const editor = asPlaceholderEditor({
      getType: (key: string) => key,
      tf: {
        insertNodes,
        withoutNormalizing: (fn) => {
          withoutNormalizingCalls += 1;
          fn();
        },
      },
    });

    insertPlaceholder(editor, KEYS.img, { at: [0] });

    expect(withoutNormalizingCalls).toBe(1);
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
    const editor = asPlaceholderEditor({
      getType: (key: string) => key,
      tf: {
        insertNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    });

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
