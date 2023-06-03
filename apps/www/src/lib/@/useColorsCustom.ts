import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

export const useColorsCustomState = ({
  color,
  colors,
  customColors,
  updateCustomColor,
}) => {
  const [customColor, setCustomColor] = useState<string>();

  const [value, setValue] = useState<string>(color || '#000000');

  useEffect(() => {
    if (
      !color ||
      customColors.some((c) => c.value === color) ||
      colors.some((c) => c.value === color)
    ) {
      return;
    }

    setCustomColor(color);
  }, [color, colors, customColors]);

  const computedColors = useMemo(
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
  const updateCustomColorDebounced = useCallback(
    debounce(updateCustomColor, 100),
    [updateCustomColor]
  );

  return {
    inputProps: {
      value,
      onChange: (e) => {
        setValue(e.target.value);
        updateCustomColorDebounced(e.target.value);
      },
    },
    menuItemProps: {
      onSelect: (e) => {
        e.preventDefault();
      },
    },
  };
};
