import { renderHook } from '@testing-library/react-hooks';
import { createMentionPlugin } from '../../createMentionPlugin';

it('should accept arbirtrary data with value field', () => {
  const { result } = renderHook(() =>
    createMentionPlugin({
      mentionables: [
        { value: 'John Snow', id: 5, house: ['Targaryen', 'Stark'] },
      ],
    })
  );

  expect(result.current.getMentionSelectProps().valueIndex).toBe(0);
});
