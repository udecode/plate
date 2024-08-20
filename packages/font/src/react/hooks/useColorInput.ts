import React from 'react';

export const useColorInput = () => {
  const ref = React.useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    // force click action on the input to open color picker
    ref.current?.click();
  };

  return {
    childProps: {
      onClick,
    },
    inputRef: ref,
  };
};
