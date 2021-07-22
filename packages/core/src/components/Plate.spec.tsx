import React from 'react';
import { render } from '@testing-library/react';
import { Plate } from './Plate';

describe('Plate', () => {
  it('should render', () => {
    render(<Plate />);

    expect(1).toBe(1);
  });
});
