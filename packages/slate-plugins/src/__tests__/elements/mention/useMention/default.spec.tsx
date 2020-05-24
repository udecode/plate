import { renderHook } from '@testing-library/react-hooks';
import { useMention } from 'elements/mention';

it('should be', () => {
  const { result } = renderHook(() => useMention());

  expect(result.current.index).toBe(0);
});

it('should accept arbirtrary data with value field', () => {
  const { result } = renderHook(() =>
    useMention([{ value: 'John Snow', id: 5, house: ['Targaryen', 'Stark'] }])
  );

  expect(result.current.index).toBe(0);
});
