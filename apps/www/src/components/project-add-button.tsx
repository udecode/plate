'use client';

import { cn } from '@udecode/cn';
import { Check, PlusCircle } from 'lucide-react';

import { useProject } from '@/hooks/use-project';
import { Button } from '@/registry/default/plate-ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';

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
