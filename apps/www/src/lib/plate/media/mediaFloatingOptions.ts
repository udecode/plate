import { flip, offset, PopoverProps, shift } from '@udecode/plate-floating';

export const mediaFloatingOptions: PopoverProps['floatingOptions'] = {
  middleware: [
    offset(-6),
    flip({
      padding: 96,
    }),
    shift(),
  ],
};
