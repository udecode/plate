'use client';

import React, { ReactNode, useState } from 'react';

import { cn } from '@/lib/utils';
import { Separator } from '@/registry/default/plate-ui/separator';

import { Icons } from './icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Card } from './ui/card';

type Item = {
  name: string;
  default?: string | boolean;
  type: string;
  description?: string;
  value?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
};

export function APIItem({
  children,
  name,
  type,
  value,
  optional,
  required,
}: Item) {
  return (
    <AccordionItem value={value ?? name} className="select-text">
      <AccordionTrigger className="group hover:no-underline">
        <li id={name} className="scroll-mt-[56px]">
          <h4 className="relative py-2 text-start font-semibold leading-none tracking-tight">
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
            <span className="font-mono font-semibold leading-none group-hover:underline">
              {name}
            </span>
            {required && (
              <span className="font-mono text-xs leading-none text-orange-500">
                {' '}
                REQUIRED
              </span>
            )}
            <span className="text-left font-mono text-sm font-medium leading-none text-muted-foreground">
              {!required && optional && ' optional'} {type}
            </span>
          </h4>
        </li>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

export function APIAttributes({ children, ...props }: APIListProps) {
  return (
    <APIList type="attributes" {...props}>
      {children}
    </APIList>
  );
}

export function APIProps({ children, ...props }: APIListProps) {
  return (
    <APIList type="props" {...props}>
      {children}
    </APIList>
  );
}

export function APIState({ children, ...props }: APIListProps) {
  return (
    <APIList type="state" {...props}>
      {children}
    </APIList>
  );
}

export function APIReturns({ children, ...props }: APIListProps) {
  return (
    <APIList type="returns" {...props}>
      {children}
    </APIList>
  );
}

export function APIParameters({ children, ...props }: APIListProps) {
  return (
    <APIList type="parameters" {...props}>
      {children}
    </APIList>
  );
}

type APIListProps = {
  type?: string;
  collapsed?: boolean;
  children: ReactNode;
};

export function APIList({
  type = 'parameters',
  collapsed = false,
  children,
}: APIListProps) {
  const childCount = React.Children.count(children);
  const hasItems = React.Children.toArray(children).some(
    (child) => (child as any)?.type?.name === 'APIItem'
  );
  const newValues = Array.from(Array.from({ length: childCount }).keys()).map(
    (i) => i.toString()
  );
  const defaultValues = collapsed ? [] : newValues;

  const [values, setValues] = useState<string[]>(defaultValues);
  const [expanded, setExpanded] = useState(!collapsed);

  if (type === 'returns' && !childCount) return null;

  return (
    <section className="flex w-full flex-col items-center">
      <div className="w-full">
        <div className="mt-10 pb-3 ">
          <div className="mt-5 flex items-center justify-between pb-4">
            <h3 className="text-lg font-medium leading-none tracking-tight">
              {type === 'parameters' && 'Parameters'}
              {type === 'attributes' && 'Attributes'}
              {type === 'returns' && 'Returns'}
              {type === 'props' && 'Props'}
              {type === 'state' && 'State'}
            </h3>

            {hasItems && (
              <div
                className="cursor-pointer select-none text-sm text-muted-foreground"
                onClick={() => {
                  values.length === childCount
                    ? setValues([])
                    : setValues(newValues);
                  setExpanded(!expanded);
                }}
              >
                {values.length === childCount ? 'Collapse all' : 'Expand all'}
              </div>
            )}
          </div>

          <ul className="m-0 list-none p-0">
            <Separator />

            {hasItems ? (
              <Accordion
                type="multiple"
                value={values}
                onValueChange={setValues}
                className="w-full"
              >
                {React.Children.map(children, (child, i) => {
                  return React.cloneElement(child as any, {
                    value: i.toString(),
                    className: 'pt-4',
                  });
                })}
              </Accordion>
            ) : childCount > 0 ? (
              children
            ) : (
              <div className="py-4 text-sm text-muted-foreground">
                No parameters.
              </div>
            )}
          </ul>
        </div>
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
          <span className="ml-1 font-mono text-xs leading-none text-orange-500">
            {' '}
            REQUIRED
          </span>
        )}
        <span className="text-left font-mono text-sm font-medium leading-none text-muted-foreground group-hover:no-underline">
          {!required && optional && ' optional'} {type}
        </span>
      </h4>
      <div>{children}</div>
    </div>
  );
}

export function APISubList({
  open,
  children,
}: {
  children: ReactNode;
  open?: boolean;
}) {
  const [value, setValue] = useState(open ? '1' : '');

  return (
    <Card className="my-2">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={open ? '1' : ''}
        onValueChange={setValue}
      >
        <AccordionItem value="1" className="border-none">
          <AccordionTrigger iconVariant="plus" className="group px-3">
            {value ? 'Hide' : 'Show'} child attributes
          </AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
