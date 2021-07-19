import { renderHook } from '@testing-library/react-hooks';
import { usePlate } from './usePlate';

describe('usePlate', () => {
  describe('when default options', () => {
    it('should be', () => {
      const { result } = renderHook(() => usePlate({}));

      expect(result.current.slateProps.value).toEqual([
        {
          children: [
            {
              text: '',
            },
          ],
        },
      ]);
    });
  });
});
