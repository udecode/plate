import { ELEMENT_PARAGRAPH } from '../../../../../slate-plugins/src/elements/paragraph/defaults';
import { getNodeDeserializer } from '../../../utils/getNodeDeserializer';

const node = () => ({ type: ELEMENT_PARAGRAPH });

it('should be', () => {
  const res = getNodeDeserializer({
    type: ELEMENT_PARAGRAPH,
    getNode: node,
    rules: [{ nodeNames: 'P' }],
  });

  expect(res[0].deserialize(document.createElement('p'))).toEqual(node());
});
