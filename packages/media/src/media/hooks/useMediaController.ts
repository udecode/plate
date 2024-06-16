import React from 'react';

export const useMediaControllerState = () => {
  const [alignOpen, setAlignOpen] = React.useState(false);

  return {
    alignOpen,
    setAlignOpen,
  };
};

export const useMediaController = ({
  setAlignOpen,
}: ReturnType<typeof useMediaControllerState>) => {
  return {
    MeidaControllerDropDownMenuProps: {
      setAlignOpen: setAlignOpen,
    },
  };
};

export const useMediaControllerDropDownMenu = (props: {
  openState: {
    onOpenChange: (_value?: boolean) => void;
    open: boolean;
  };
  setAlignOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  React.useEffect(
    () => props.setAlignOpen(props.openState.open),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.openState.open]
  );
};
