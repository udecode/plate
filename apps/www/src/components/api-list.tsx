'use client';

import React, { ReactNode, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Separator } from './ui/separator';
import { Icons } from './icons';

import { cn } from '@/lib/utils';

type Item = {
  name: string;
  default?: string | boolean;
  type: string;
  description?: string;
  value?: string;
  children: ReactNode;
};

export function APIItem({ children, name, type, value }: Item) {
  return (
    <AccordionItem value={value ?? name}>
      <AccordionTrigger className="group">
        <li id={name} className="scroll-mt-[56px]">
          <h4 className="relative flex py-2 font-semibold leading-none tracking-tight">
            <a
              href={`#${name}`}
              className={cn(
                'opacity-0 hover:opacity-100 group-hover:opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -left-5 top-2 pr-1">
                <Icons.pragma className="h-4 w-4 text-muted-foreground" />
              </div>
            </a>
            <div className="mr-2 font-mono font-semibold leading-5">{name}</div>
            <div className="mr-2 text-left font-mono text-sm font-medium leading-5 text-muted-foreground">
              {type}
            </div>
          </h4>
        </li>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

// export function ComponentSourceBadgeList() {
//
// }

export function APIList({
  type = 'function',
  description,
  children,
}: {
  type?: string;
  description?: string;
  children: ReactNode;
}) {
  const defaultValues = Array.from(
    Array(React.Children.count(children)).keys()
  ).map((i) => i.toString());

  const [values, setValues] = useState<string[]>(defaultValues);
  const [expanded, setExpanded] = useState(true);

  const childCount = React.Children.count(children);

  return (
    <section className="flex w-full flex-col items-center">
      <div className="w-full pb-16">
        {!!description && <p className="mt-10">{description}</p>}

        <div className="mt-10 pb-3 ">
          <div className="mt-5 flex items-center justify-between pb-4">
            <h3 className="text-lg font-medium leading-none tracking-tight">
              {type === 'function' && <span>Parameters</span>}
              {type === 'object' && <span>Attributes</span>}
            </h3>
            <div
              className="cursor-pointer select-none text-sm text-muted-foreground"
              onClick={() => {
                values.length === childCount
                  ? setValues([])
                  : setValues(defaultValues);
                setExpanded(!expanded);
              }}
            >
              {values.length === childCount ? 'Collapse all' : 'Expand all'}
            </div>
          </div>

          <ul className="m-0 list-none p-0">
            <Separator />

            <Accordion
              type="multiple"
              value={values}
              onValueChange={setValues}
              className="w-full"
            >
              {React.Children.map(children, (child, i) =>
                React.cloneElement(child as any, { value: i.toString() })
              )}
            </Accordion>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function APISubList({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <Accordion type="single" className="w-full">
      <AccordionItem value="one">
        <AccordionTrigger>Show child attributes</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
