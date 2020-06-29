import { getNodeDeserializer } from '@udecode/core/src';
import { PARAGRAPH } from '../../../../elements/paragraph';

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
