'use client';

import React, { ReactNode, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Icons } from './icons';

import { cn } from '@/lib/utils';

type Item = {
  name: string;
  default?: string | boolean;
  type: string;
  description?: string;
  value?: string;
  optional?: boolean;
  children: ReactNode;
};

export function APIItem({ children, name, type, value }: Item) {
  return (
    <AccordionItem value={value ?? name} className="select-text">
      <AccordionTrigger className="group">
        <li id={name} className="scroll-mt-[56px]">
          <h4 className="relative py-2 font-semibold leading-none tracking-tight">
            <a
              href={`#${name}`}
              className={cn(
                'opacity-0 hover:opacity-100 group-hover:opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -left-5 top-2 pr-1 leading-none">
                <Icons.pragma className="h-4 w-4 text-muted-foreground" />
              </div>
            </a>
            <span className="mr-2 font-mono font-semibold leading-none">
              {name}
            </span>
            <span className="mr-2 text-left font-mono text-sm font-medium leading-none text-muted-foreground group-hover:no-underline">
              {type}
            </span>
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
  returns,
  children,
}: {
  type?: string;
  description?: string;
  returns?: string;
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
      <div className="w-full">
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

        {!!returns && (
          <div className="mt-5 pt-6">
            <h3 className="pb-4 text-lg font-medium leading-none tracking-tight">
              Returns
            </h3>

            <Separator />

            <p className="mt-5">{returns}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function APISubListItem({
  parent,
  name,
  type,
  optional,
  required,
  children,
}: {
  parent: string;
  name: string;
  type: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-t-border p-3">
      <h4 className="relative py-2 font-mono font-semibold tracking-tight">
        {/* <a */}
        {/*  href={`#${name}`} */}
        {/*  className={cn('opacity-0 hover:opacity-100 group-hover:opacity-100')} */}
        {/*  onClick={(e) => e.stopPropagation()} */}
        {/* > */}
        {/*  <div className="absolute -left-5 top-2 pr-1"> */}
        {/*    <Icons.pragma className="h-4 w-4 text-muted-foreground" /> */}
        {/*  </div> */}
        {/* </a> */}
        <span className="font-semibold leading-none text-muted-foreground">
          {parent}.
        </span>
        <span className="font-semibold leading-none">{name}</span>
        {required && (
          <span className="ml-2 font-mono text-xs leading-none text-orange-500">
            REQUIRED
          </span>
        )}
        {!required && optional && (
          <span className="ml-2 text-left text-sm font-medium leading-none text-muted-foreground">
            optional
          </span>
        )}
        <span className="ml-2 text-left text-sm font-medium leading-none text-muted-foreground">
          {type}
        </span>
      </h4>
      <div>{children}</div>
    </div>
  );
}

export function APISubList({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('');

  return (
    <Card className="my-2">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="1"
        onValueChange={setValue}
      >
        <AccordionItem value="1" className="border-none">
          <AccordionTrigger iconVariant="plus" className="px-3">
            {value ? 'Hide' : 'Show'} child attributes
          </AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
