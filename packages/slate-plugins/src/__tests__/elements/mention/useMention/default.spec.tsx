import { renderHook } from '@testing-library/react-hooks';
import { useMention } from 'elements/mention';

it('should be', () => {
  const { result } = renderHook(() => useMention());

  expect(result.current.index).toBe(0);
});
