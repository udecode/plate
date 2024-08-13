import { ParagraphPlugin } from '@udecode/plate-common';

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
              type: ParagraphPlugin.key,
            },
          ],
        }
      )
    ).toBe('<div>I am centered text!</div>');
  });
});
