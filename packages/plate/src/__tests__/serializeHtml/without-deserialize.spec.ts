import { createParagraphPlugin } from '@udecode/plate-paragraph';

import { ELEMENT_PARAGRAPH } from '@/nodes/paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';
import { serializeHtml } from '@/serializers/html/src/serializeHtml';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    const plugin = createParagraphPlugin({
      serializeHtml: null,
    });

    expect(
      serializeHtml(
        createPlateUIEditor({
          plugins: [plugin],
        }),
        {
          nodes: [
            {
              type: ELEMENT_PARAGRAPH,
              children: [{ text: 'I am centered text!' }],
            },
          ],
        }
      )
    ).toBe('<div>I am centered text!</div>');
  });
});
