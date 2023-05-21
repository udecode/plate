import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from 'apps/www/src/createPlateUIEditor';
import { serializeHtml } from '../serializeHtml';

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
