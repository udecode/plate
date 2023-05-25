import { cn, cva } from '@udecode/plate-tailwind';

import { buttonVariants } from '@/components/ui/button';

export const floatingStyles = {
  rootVariants: cva(
    cn(
      '!z-40 w-auto bg-background',
      'rounded-[4px] shadow-[rgb(15_15_15_/_5%)_0_0_0_1px,_rgb(15_15_15_/_10%)_0_3px_6px,_rgb(15_15_15_/_20%)_0_9px_24px]'
    )
  ),
  rowVariants: cva('flex flex-row items-center px-2 py-1'),
  buttonVariants: cva(cn(buttonVariants({ variant: 'ghost' }), 'px-1')),
  iconWrapperVariants: cva('flex items-center px-2 text-muted-foreground'),
  inputWrapperVariants: cva('flex items-center py-1 pr-2'),
  inputVariants: cva(
    'h-8 grow border-none bg-transparent p-0 text-sm leading-5 focus:outline-none'
  ),
};
