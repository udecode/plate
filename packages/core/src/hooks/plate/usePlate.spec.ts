import { renderHook } from '@testing-library/react-hooks';
import { ELEMENT_DEFAULT } from '../../types/plate/node.types';
import { usePlate } from './usePlate';

describe('usePlate', () => {
  describe('when default options', () => {
    it('should be', () => {
      const { result } = renderHook(() => usePlate({}));

      expect(result.current.slateProps.value).toEqual([
        {
          type: ELEMENT_DEFAULT,
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
