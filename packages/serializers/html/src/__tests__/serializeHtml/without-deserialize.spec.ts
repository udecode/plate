import { ELEMENT_PARAGRAPH } from '@/packages/nodes/paragraph/src/createParagraphPlugin';
import { createParagraphPlugin } from '@/packages/nodes/paragraph/src/index';
import { serializeHtml } from '@/packages/serializers/html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

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
