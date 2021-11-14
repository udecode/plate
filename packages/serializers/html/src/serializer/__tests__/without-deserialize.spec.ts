import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createPlateEditor } from '../../../../../plate/src/utils/createPlateEditor';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    const plugin = createParagraphPlugin();
    delete plugin.deserialize;

    expect(
      serializeHTMLFromNodes(
        createPlateEditor({
          plugins: [plugin],
        }),
        {
          plugins: [plugin],
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
