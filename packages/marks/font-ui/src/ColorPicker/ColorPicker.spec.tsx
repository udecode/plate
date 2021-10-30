import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  it('should render a color picker', async () => {
    const updateColor = jest.fn();
    const clearColor = jest.fn();
    render(
      <ColorPicker
        color="#FFFFFF"
        selectedIcon={<div data-testid="SelectedIcon">Selected</div>}
        updateColor={updateColor}
        clearColor={clearColor}
      />
    );

    expect(await screen.findAllByTestId('ColorButton')).toHaveLength(85);
    expect(screen.queryByTestId('SelectedIcon')).toBeInTheDocument();
  });

  it('should render a color picker with no selected color', async () => {
    const updateColor = jest.fn();
    const clearColor = jest.fn();
    render(
      <ColorPicker
        selectedIcon={<div data-testid="SelectedIcon">Selected</div>}
        updateColor={updateColor}
        clearColor={clearColor}
      />
    );

    expect(await screen.findAllByTestId('ColorButton')).toHaveLength(85);
    expect(screen.queryByTestId('SelectedIcon')).not.toBeInTheDocument();
  });

  it('should update color', async () => {
    const updateColor = jest.fn();
    const clearColor = jest.fn();
    render(
      <ColorPicker
        color="#FFFFFF"
        selectedIcon={<div data-testid="SelectedIcon">Selected</div>}
        updateColor={updateColor}
        clearColor={clearColor}
      />
    );

    const colorButton = screen.getByRole('button', { name: 'light cyan 3' });
    userEvents.click(colorButton);

    expect(updateColor).toHaveBeenCalledWith('#D0DFE3');
  });

  it('should clear selected color', async () => {
    const updateColor = jest.fn();
    const clearColor = jest.fn();
    render(
      <ColorPicker
        color="#FFFFFF"
        selectedIcon={<div data-testid="SelectedIcon">Selected</div>}
        updateColor={updateColor}
        clearColor={clearColor}
      />
    );

    const clearButton = screen.getByTestId('ColorPickerClear');
    userEvents.click(clearButton);

    expect(clearColor).toHaveBeenCalled();
  });
});
