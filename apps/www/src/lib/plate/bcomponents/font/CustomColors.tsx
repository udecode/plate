import React, { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import { ColorInput } from './ColorInput';
import { Colors } from './Colors';
import { TColor } from './TColor';

import { buttonVariants } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type CustomColorsProps = {
  color?: string;
  colors: TColor[];
  customColors: TColor[];
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
};

export function CustomColors({
  color,
  colors,
  customColors,
  updateColor,
  updateCustomColor,
}: CustomColorsProps) {
  const [customColor, setCustomColor] = useState<string>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCustomColorDebounced = useCallback(
    debounce(updateCustomColor, 100),
    [updateCustomColor]
  );

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

  return (
    <div className="flex flex-col gap-4">
      <ColorInput
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          updateCustomColorDebounced(e.target.value);
        }}
      >
        <DropdownMenuItem
          className={buttonVariants({
            variant: 'outline',
            isMenu: true,
          })}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          CUSTOM
        </DropdownMenuItem>
      </ColorInput>

      <Colors color={color} colors={computedColors} updateColor={updateColor} />
    </div>
  );
}
