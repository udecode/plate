import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/defaults';
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

it('should be', () => {
  const res = getNodeDeserializer({
    type: ELEMENT_PARAGRAPH,
    getNode: node,
    rules: [
      {
        style: {
          color: '#333',
        },
      },
    ],
  });

  const element = document.createElement('p');
  element.style.color = '#FF0000';
  const deserializedElement = res[0].deserialize(element);

  expect(deserializedElement).not.toEqual(node());
});

it('should be', () => {
  const res = getNodeDeserializer({
    type: ELEMENT_PARAGRAPH,
    getNode: node,
    rules: [
      {
        style: {
          color: '#FF0000',
        },
      },
    ],
  });

  const element = document.createElement('p');
  element.style.color = '#FF0000';
  const deserializedElement = res[0].deserialize(element);

  expect(deserializedElement).not.toEqual(node());
});

it('should be', () => {
  const res = getNodeDeserializer({
    type: ELEMENT_PARAGRAPH,
    getNode: node,
    rules: [
      {
        style: {
          color: '*',
        },
      },
    ],
  });

  const element = document.createElement('p');
  element.style.color = '#FF0000';
  const deserializedElement = res[0].deserialize(element);

  expect(deserializedElement).toEqual(node());
});
