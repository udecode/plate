import { deserializeFragment } from 'deserializers/utils/deserializeFragment';

describe('when deserializeFragment', () => {
  describe('when el is a body', () => {
    it('should return a fragment', () => {
      const fragment = [
        {
          type: 'p',
          children: [{ text: 'test' }],
        },
      ];

      expect(
        deserializeFragment({
          el: document.createElement('body'),
          children: fragment,
        })
      ).toEqual(fragment);
    });
  });

  describe('when el is not a body', () => {
    it('should be undefined', () => {
      expect(
        deserializeFragment({
          el: document.createElement('div'),
          children: [],
        })
      ).toBeUndefined();
    });
  });
});
