import { createEditor as createProductEditor } from 'platejs/react';

import { AutoformatKit } from '@/registry/components/editor/autoformat';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';

const typeIntoParagraph = (keys: string) => {
  const editor = createProductEditor({
    plugins: [...BasicMarksKit, ...AutoformatKit],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
  });

  for (const key of keys) editor.update.text.insert(key);

  return editor;
};

describe('AutoformatKit current contract', () => {
  it('turns a typed `->` into an arrow', () => {
    const editor = typeIntoParagraph('->');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '→' }], type: 'paragraph' },
    ]);
  });

  it.failing(
    'highlights text typed between `==` delimiters (t_167ab658)',
    () => {
      const editor = typeIntoParagraph('==hello==');

      expect(editor.read.children()).toEqual([
        { children: [{ highlight: true, text: 'hello' }], type: 'paragraph' },
      ]);
    }
  );
});
