import { createPlateUIEditor } from 'www/src/lib/plate/createPlateUIEditor';

import { ELEMENT_PARAGRAPH } from '@/packages/paragraph/src/createParagraphPlugin';
import { createParagraphPlugin } from '@/packages/paragraph/src/index';
import { serializeHtml } from '@/packages/serializer-html/src/serializeHtml';

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
