'use client';

import * as React from 'react';

import type { PlateElementProps } from '@udecode/plate/react';

import {
  useToggleButton,
  useToggleButtonState,
} from '@udecode/plate-toggle/react';
import { PlateElement } from '@udecode/plate/react';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ToggleElement(props: PlateElementProps) {
  const element = props.element;
  const state = useToggleButtonState(element.id as string);
  const { buttonProps, open } = useToggleButton(state);

  return (
    <PlateElement {...props} className="pl-6">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-0 -left-0.5 size-6 cursor-pointer items-center justify-center rounded-md p-px text-muted-foreground transition-colors select-none hover:bg-accent [&_svg]:size-4"
        contentEditable={false}
        {...buttonProps}
      >
        <ChevronRight
          className={
            open
              ? 'rotate-90 transition-transform duration-75'
              : 'rotate-0 transition-transform duration-75'
          }
        />
      </Button>
      {props.children}
    </PlateElement>
  );
}
