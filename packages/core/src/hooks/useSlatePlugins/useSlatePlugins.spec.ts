import { renderHook } from '@testing-library/react-hooks';
import { useSlatePlugins } from './useSlatePlugins';

describe('useSlatePlugins', () => {
  describe('when default options', () => {
    it('should be', () => {
      const { result } = renderHook(() => useSlatePlugins({}));

      expect(result.current.getSlateProps().value).toEqual([]);
    });
  });
});
