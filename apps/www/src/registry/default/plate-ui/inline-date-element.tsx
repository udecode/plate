'use client';
import React from 'react';

import type { TInlineDateElement } from '@udecode/plate-date';

import { cn } from '@udecode/cn';
import {
  PlateElement,
  findNodePath,
  setNodes,
  useEditorRef,
  useElement,
  withRef,
} from '@udecode/plate-common';
import { format } from 'date-fns';

import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export const InlineDateElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement<TInlineDateElement>();

    console.log(element, 'fj');

    const editor = useEditorRef();
    const path = findNodePath(editor, element);

    return (
      <PlateElement
        className={cn('inline-block', className)}
        contentEditable={false}
        ref={ref}
        {...props}
      >
        <Popover>
          <PopoverTrigger asChild>
            <span
              className={cn(
                'w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground'
              )}
              contentEditable={false}
            >
              {element.date ? (
                (() => {
                  const today = new Date();
                  const elementDate = new Date(element.date);
                  const isToday =
                    elementDate.getDate() === today.getDate() &&
                    elementDate.getMonth() === today.getMonth() &&
                    elementDate.getFullYear() === today.getFullYear();

                  const isYesterday =
                    new Date(
                      today.setDate(today.getDate() - 1)
                    ).toDateString() === elementDate.toDateString();
                  const isTomorrow =
                    new Date(
                      today.setDate(today.getDate() + 2)
                    ).toDateString() === elementDate.toDateString();

                  if (isToday) return 'Today';
                  if (isYesterday) return 'Yesterday';
                  if (isTomorrow) return 'Tomorrow';

                  return format(elementDate, 'PPP');
                })()
              ) : (
                <span>Pick a date</span>
              )}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              initialFocus
              mode="single"
              onSelect={(date) => {
                if (!date) return;

                setNodes(
                  editor,
                  { date: format(date, 'yyyy-MM-dd') },
                  { at: path }
                );
              }}
              selected={new Date(element.date)}
            />
          </PopoverContent>
        </Popover>
        {children}
      </PlateElement>
    );
  }
);
