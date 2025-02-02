import React from 'react';

export const useColorDropdownMenuState = ({
  colors,
  customColors,
}: {
  colors: { isBrightColor: boolean; name: string; value: string }[];
  customColors: { isBrightColor: boolean; name: string; value: string }[];
  closeOnSelect?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const onToggle = React.useCallback(
    (value = !open) => {
      setOpen(value);
    },
    [open, setOpen]
  );

  return {
    colors,
    customColors,
    open,
    onToggle,
  };
};

export const useColorDropdownMenu = ({
  open,
  onToggle,
}: ReturnType<typeof useColorDropdownMenuState>) => {
  return {
    buttonProps: {
      pressed: open,
    },
    menuProps: {
      open,
      onOpenChange: onToggle,
    },
  };
};
