import React from 'react';
import debounce from 'lodash/debounce.js';

export const useColorsCustomState = ({
  color,
  colors,
  customColors,
  updateCustomColor,
}: {
  color?: string;
  colors: any[];
  customColors: any[];
  updateCustomColor: (color: string) => void;
}) => {
  const [customColor, setCustomColor] = React.useState<string>();

  const [value, setValue] = React.useState<string>(color || '#000000');

  React.useEffect(() => {
    if (
      !color ||
      customColors.some((c) => c.value === color) ||
      colors.some((c) => c.value === color)
    ) {
      return;
    }

    setCustomColor(color);
  }, [color, colors, customColors]);

  const computedColors = React.useMemo(
    () =>
      customColor
        ? [
            ...customColors,
            {
              name: '',
              value: customColor,
              isBrightColor: false,
            },
          ]
        : customColors,
    [customColor, customColors]
  );

  return {
    value,
    setValue,
    computedColors,
    updateCustomColor,
  };
};

export const useColorsCustom = ({
  updateCustomColor,
  value,
  setValue,
}: ReturnType<typeof useColorsCustomState>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCustomColorDebounced = React.useCallback(
    debounce(updateCustomColor, 100),
    [updateCustomColor]
  );

  return {
    inputProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        updateCustomColorDebounced(e.target.value);
      },
    },
    menuItemProps: {
      onSelect: (e: Event) => {
        e.preventDefault();
      },
    },
  };
};
