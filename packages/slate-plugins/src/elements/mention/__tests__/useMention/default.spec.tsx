import { renderHook } from '@testing-library/react-hooks';
import { useMentionPlugin } from '../../useMentionPlugin';

it('should accept arbirtrary data with value field', () => {
  const { result } = renderHook(() =>
    useMentionPlugin({
      mentionables: [
        { value: 'John Snow', id: 5, house: ['Targaryen', 'Stark'] },
      ],
    })
  );

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
