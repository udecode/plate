import { getRenderElement } from '@udecode/slate-plugins-common';
import { options } from '../../../../../../stories/config/initialValues';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    expect(
      serializeHTMLFromNodes({
        plugins: [{ renderElement: getRenderElement(options.align_center) }],
        nodes: [
          { type: 'align_center', children: [{ text: 'I am centered text!' }] },
        ],
      })
    ).toBe('<div>I am centered text!</div>');
  });
});
