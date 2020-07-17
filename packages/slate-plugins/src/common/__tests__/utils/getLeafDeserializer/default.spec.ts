import { getLeafDeserializer } from '../../../utils/getLeafDeserializer';

it('should be', () => {
  const el = document.createElement('strong');
  el.textContent = 'hello';

  expect(
    getLeafDeserializer({
      type: 'bold',
      rules: [{ nodeNames: 'strong' }],
    })[0].deserialize(document.createElement('strong'))
  ).toBe(undefined);
});
