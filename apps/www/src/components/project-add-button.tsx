'use client';

import { Check, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProject } from '@/hooks/use-project';
import { cn } from '@/lib/utils';

export function ProjectAddButton({
  className,
  name,
  ...props
}: React.ComponentProps<typeof Button> & { name: string }) {
  const { addBlock, isAdded } = useProject();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn('rounded-sm', className)}
          onClick={() => {
            addBlock(name);
          }}
          {...props}
        >
          {isAdded ? <Check /> : <PlusCircle />}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={10}>Add to Project</TooltipContent>
    </Tooltip>
  );
}
