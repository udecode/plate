import { ELEMENT_PARAGRAPH } from '../../../../elements/paragraph/index';
import { getNodeDeserializer } from '../../../utils/getNodeDeserializer';

const node = () => ({ type: ELEMENT_PARAGRAPH });

it('should be', () => {
  const res = getNodeDeserializer({
    type: ELEMENT_PARAGRAPH,
    node,
    rules: [{ nodeNames: 'P' }],
  });

  expect(res[0].deserialize(document.createElement('p'))).toEqual(node());
});
