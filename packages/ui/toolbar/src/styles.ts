import { cn, cva } from '@udecode/plate-styled-components';
import { buttonVariants } from '@udecode/plate-ui-button';

export const floatingVariants = cva('', {
  variants: {
    element: {
      root: cn(
        '!z-40 w-auto bg-white',
        'rounded-[4px] shadow-[rgb(15_15_15_/_5%)_0_0_0_1px,_rgb(15_15_15_/_10%)_0_3px_6px,_rgb(15_15_15_/_20%)_0_9px_24px]'
      ),
      row: 'flex flex-row items-center px-2 py-1',
      button: cn(buttonVariants(), 'px-1'),
      iconWrapper: 'flex items-center px-2 text-gray-400',
      inputWrapper: 'flex items-center py-1 pr-2',
      input:
        'h-8 flex-grow border-none bg-transparent p-0 leading-5 focus:outline-none',
    },
  },
});
