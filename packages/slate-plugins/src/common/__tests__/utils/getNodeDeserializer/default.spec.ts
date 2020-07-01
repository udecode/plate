import { PARAGRAPH } from '../../../../elements/paragraph/index';
import { getNodeDeserializer } from '../../../utils/getNodeDeserializer';

const createNode = () => ({ type: PARAGRAPH });

const output = {
  P: createNode,
  p: createNode,
};

it('should be', () => {
  expect(
    getNodeDeserializer(PARAGRAPH, {
      createNode,
      tagNames: ['P'],
    })
  ).toEqual(output);
});
