import { ELEMENT_PARAGRAPH, ParagraphPlugin } from '@udecode/plate-paragraph';
import { createPlateUIEditor } from 'www/src/lib/plate/create-plate-ui-editor';

import { serializeHtml } from '../../serializeHtml';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    const plugin = ParagraphPlugin.extend({
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
              children: [{ text: 'I am centered text!' }],
              type: ELEMENT_PARAGRAPH,
            },
          ],
        }
      )
    ).toBe('<div>I am centered text!</div>');
  });
});
