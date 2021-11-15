import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    const plugin = createParagraphPlugin({
      deserialize: null,
    });

    expect(
      serializeHTMLFromNodes(
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
