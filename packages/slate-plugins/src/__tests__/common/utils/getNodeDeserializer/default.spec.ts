import { getNodeDeserializer } from 'common/utils/getNodeDeserializer';
import { PARAGRAPH } from 'elements/paragraph';

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
