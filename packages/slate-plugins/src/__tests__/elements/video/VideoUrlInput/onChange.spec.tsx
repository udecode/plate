import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { VideoUrlInput } from 'elements/video/components';

it('should render', () => {
  const onChange = jest.fn();

  const { getByTestId } = render(
    <VideoUrlInput data-testid="VideoUrlInput" url="test" onChange={onChange} />
  );

  const element = getByTestId('VideoUrlInput');

  fireEvent.change(element, {
    target: { value: 'testt' },
  });
  fireEvent.click(element);

  expect(onChange).toBeCalled();
});
