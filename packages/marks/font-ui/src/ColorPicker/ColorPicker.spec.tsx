import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import {
  DEFAULT_COLORS,
  DEFAULT_CUSTOM_COLORS,
} from '../ToolbarColorPicker/defaults';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  it('should render a color picker', async () => {
    const updateColor = jest.fn();
    const clearColor = jest.fn();
    render(
      <ColorPicker
        color="#FFFFFF"
        colors={DEFAULT_COLORS}
        customColors={DEFAULT_CUSTOM_COLORS}
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
        colors={DEFAULT_COLORS}
        customColors={DEFAULT_CUSTOM_COLORS}
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
        colors={DEFAULT_COLORS}
        customColors={DEFAULT_CUSTOM_COLORS}
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
        colors={DEFAULT_COLORS}
        customColors={DEFAULT_CUSTOM_COLORS}
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
