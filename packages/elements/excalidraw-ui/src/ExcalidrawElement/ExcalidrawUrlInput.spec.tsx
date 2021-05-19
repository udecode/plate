import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { getExcalidrawElementStyles } from './ExcalidrawElement.styles';
import { ExcalidrawUrlInput } from './ExcalidrawUrlInput';

it('should render', () => {
  const onChange = jest.fn();

  const { getByTestId } = render(
    <ExcalidrawUrlInput
      data-testid="ExcalidrawUrlInput"
      url="test"
      onChange={onChange}
    />
  );

  const element = getByTestId('ExcalidrawUrlInput');

  fireEvent.change(element, {
    target: { value: 'testt' },
  });
  fireEvent.click(element);

  expect(onChange).toBeCalled();
});
