import React from 'react';
import { render } from '@testing-library/react';
import { SlatePlugins } from './SlatePlugins';

describe('SlatePlugins', () => {
  it('should render', () => {
    render(<SlatePlugins />);

    expect(1).toBe(1);
  });
});
