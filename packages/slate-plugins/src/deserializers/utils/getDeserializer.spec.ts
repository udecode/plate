import { getDeserializer } from './getDeserializer';

describe('when getDeserializer', () => {
  it('should ', () => {
    const cb = () => ({ type: 'p' });

    expect(getDeserializer('p', ['p', 'P'], cb)).toEqual({
      p: cb,
      P: cb,
    });
  });
});
