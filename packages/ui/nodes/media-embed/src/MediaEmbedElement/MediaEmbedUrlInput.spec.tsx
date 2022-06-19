import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';

it('should render', () => {
  const onChange = jest.fn();

  const { getByTestId } = render(
    <MediaEmbedUrlInput
      data-testid="MediaEmbedUrlInput"
      url="test"
      onChangeValue={onChange}
    />
  );

  const element = getByTestId('MediaEmbedUrlInput');

  fireEvent.change(element, {
    target: { value: 'testt' },
  });
  fireEvent.click(element);

  expect(onChange).toBeCalled();
});
