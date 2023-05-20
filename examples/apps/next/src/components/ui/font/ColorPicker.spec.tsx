import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import { ColorPicker } from './ColorPicker';
import * as ColorPickerStyles from './ColorPicker.styles';
import { ColorType } from './ColorType';
import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './constants';

describe('ColorPicker', () => {
  let updateColor: jest.Mock;
  let updateCustomColor: jest.Mock;
  let clearColor: jest.Mock;

  let rerender: RenderResult['rerender'];

  function Component({
    color,
    colors,
    customColors,
    open,
  }: {
    color?: string;
    colors?: ColorType[];
    customColors?: ColorType[];
    open?: boolean;
  }) {
    return (
      <ColorPicker
        color={color}
        colors={colors || DEFAULT_COLORS}
        customColors={customColors || DEFAULT_CUSTOM_COLORS}
        selectedIcon={<div data-testid="SelectedIcon">Selected</div>}
        updateColor={updateColor}
        updateCustomColor={updateCustomColor}
        clearColor={clearColor}
        open={open}
      />
    );
  }

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

  describe('memo color picker', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should render once with same color, colors, and customColor', () => {
      const spyColorPickerStyles = jest.spyOn(
        ColorPickerStyles,
        'getColorPickerStyles'
      );
      const container = render(<Component color="#FFFFFF" />);
      container.rerender(<Component color="#FFFFFF" />);
      expect(spyColorPickerStyles).toHaveBeenCalledTimes(1);
    });
    it('should render twice with different color', () => {
      const spyColorPickerStyles = jest.spyOn(
        ColorPickerStyles,
        'getColorPickerStyles'
      );
      const container = render(<Component color="#FFFFFF" />);
      container.rerender(<Component color="#FFFFFE" />);
      expect(spyColorPickerStyles).toHaveBeenCalledTimes(2);
    });
    it('should render twice with different memory of colors', () => {
      const spyColorPickerStyles = jest.spyOn(
        ColorPickerStyles,
        'getColorPickerStyles'
      );
      const container = render(<Component color="#FFFFFF" />);
      container.rerender(
        <Component color="#FFFFFF" colors={[...DEFAULT_COLORS]} />
      );
      expect(spyColorPickerStyles).toHaveBeenCalledTimes(2);
    });
    it('should render twice with different memory of customColors', () => {
      const spyColorPickerStyles = jest.spyOn(
        ColorPickerStyles,
        'getColorPickerStyles'
      );
      const container = render(<Component color="#FFFFFF" />);
      container.rerender(
        <Component color="#FFFFFF" customColors={[...DEFAULT_CUSTOM_COLORS]} />
      );
      expect(spyColorPickerStyles).toHaveBeenCalledTimes(2);
    });
    it('should render once with same open value', () => {
      const spyColorPickerStyles = jest.spyOn(
        ColorPickerStyles,
        'getColorPickerStyles'
      );
      const container = render(<Component color="#FFFFFF" open />);
      container.rerender(<Component color="#FFFFFF" open />);
      expect(spyColorPickerStyles).toHaveBeenCalledTimes(1);
    });
    it('should render twice with different open value', () => {
      const spyColorPickerStyles = jest.spyOn(
        ColorPickerStyles,
        'getColorPickerStyles'
      );
      const container = render(<Component color="#FFFFFF" open />);
      container.rerender(<Component color="#FFFFFF" open={false} />);
      expect(spyColorPickerStyles).toHaveBeenCalledTimes(2);
    });
  });
});
