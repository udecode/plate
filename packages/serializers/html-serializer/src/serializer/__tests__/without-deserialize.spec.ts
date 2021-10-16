import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/defaults';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    const plugin = createParagraphPlugin();
    delete plugin.deserialize;

    expect(
      serializeHTMLFromNodes(
        createEditorPlugins({
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
