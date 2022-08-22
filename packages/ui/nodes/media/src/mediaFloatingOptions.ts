import { flip, offset, shift } from '@floating-ui/react-dom-interactions';
import { PopoverProps } from '@udecode/plate-floating';

export const mediaFloatingOptions: PopoverProps['floatingOptions'] = {
  middleware: [
    offset(-6),
    flip({
      padding: 96,
    }),
    shift(),
  ],
};
