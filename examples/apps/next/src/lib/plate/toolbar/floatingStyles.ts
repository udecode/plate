import { cn, cva } from '@udecode/plate-tailwind';
import { buttonVariants } from '../button/PlateButton';

export const floatingStyles = {
  rootVariants: cva(
    cn(
      '!z-40 w-auto bg-white',
      'rounded-[4px] shadow-[rgb(15_15_15_/_5%)_0_0_0_1px,_rgb(15_15_15_/_10%)_0_3px_6px,_rgb(15_15_15_/_20%)_0_9px_24px]'
    )
  ),
  rowVariants: cva('flex flex-row items-center px-2 py-1'),
  buttonVariants: cva(cn(buttonVariants(), 'px-1')),
  iconWrapperVariants: cva('flex items-center px-2 text-gray-400'),
  inputWrapperVariants: cva('flex items-center py-1 pr-2'),
  inputVariants: cva(
    'h-8 grow border-none bg-transparent p-0 leading-5 focus:outline-none'
  ),
};
