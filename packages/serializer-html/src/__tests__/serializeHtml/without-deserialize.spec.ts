import { ELEMENT_PARAGRAPH, ParagraphPlugin } from '@udecode/plate-paragraph';

import { serializeHtml } from '../../serializeHtml';
import { createPlateUIEditor } from '../create-plate-ui-editor';

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
