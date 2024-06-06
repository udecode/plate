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
              isBrightColor: false,
              name: '',
              value: customColor,
            },
          ]
        : customColors,
    [customColor, customColors]
  );

  return {
    computedColors,
    setValue,
    updateCustomColor,
    value,
  };
};

export const useColorsCustom = ({
  setValue,
  updateCustomColor,
  value,
}: ReturnType<typeof useColorsCustomState>) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCustomColorDebounced = React.useCallback(
    debounce(updateCustomColor, 100),
    [updateCustomColor]
  );

  return {
    inputProps: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        updateCustomColorDebounced(e.target.value);
      },
      value,
    },
    menuItemProps: {
      onSelect: (e: Event) => {
        e.preventDefault();
      },
    },
  };
};
