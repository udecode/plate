import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import {
  DEFAULT_COLORS,
  DEFAULT_CUSTOM_COLORS,
} from '../ColorPickerToolbarDropdown/constants';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  let updateColor: jest.Mock;
  let updateCustomColor: jest.Mock;
  let clearColor: jest.Mock;

  let rerender: RenderResult['rerender'];

  const Component = ({ color }: { color?: string }) => (
    <ColorPicker
      color={color}
      colors={DEFAULT_COLORS}
      customColors={DEFAULT_CUSTOM_COLORS}
      selectedIcon={<div data-testid="SelectedIcon">Selected</div>}
      updateColor={updateColor}
      updateCustomColor={updateCustomColor}
      clearColor={clearColor}
    />
  );

  beforeEach(() => {
    updateColor = jest.fn();
    updateCustomColor = jest.fn();
    clearColor = jest.fn();

    ({ rerender } = render(<Component />));
  });

  it('should render a color picker with no selected color', () => {
    expect(screen.queryByTestId('SelectedIcon')).not.toBeInTheDocument();
  });

  it('should render the provided colors', () => {
    expect(screen.queryAllByTestId('ColorButton')).toHaveLength(
      DEFAULT_COLORS.length + DEFAULT_CUSTOM_COLORS.length
    );
  });

  it('should disable the clear color button', () => {
    expect(screen.queryByTestId('ColorPickerClear')).toBeDisabled();
  });

  it('should update color', () => {
    const colorButton = screen.getByRole('button', { name: 'light cyan 3' });
    userEvents.click(colorButton);

    expect(updateColor).toHaveBeenCalledWith('#D0DFE3');
  });

  describe('when color selected', () => {
    beforeEach(() => rerender(<Component color="#FFFFFF" />));

    it('should render a color picker', () => {
      expect(screen.queryByTestId('SelectedIcon')).toBeInTheDocument();
    });

    it('should clear selected color', () => {
      const clearButton = screen.getByTestId('ColorPickerClear');
      userEvents.click(clearButton);

      expect(clearColor).toHaveBeenCalled();
    });
  });
});
