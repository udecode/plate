import { createBaseEditor } from '../../lib';
import { getNodeDataAttributes } from './getNodeDataAttributes';

describe('getNodeDataAttributes', () => {
  it('serializes scalar properties without requiring matching plugins', () => {
    const editor = createBaseEditor();

    expect(
      getNodeDataAttributes(
        editor,
        {
          children: [{ text: 'hello' }],
          customProperty: 'value',
          type: 'p',
        },
        { isElement: true }
      )
    ).toEqual({
      'data-plite-custom-property': 'value',
      'data-plite-type': 'p',
    });
  });
});
