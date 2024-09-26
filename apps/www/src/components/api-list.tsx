'use client';

import React, { type ReactNode, useState } from 'react';

import { cn } from '@udecode/cn';

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
  children: ReactNode;
  name: string;
  type: string;
  default?: boolean | string;
  description?: string;
  optional?: boolean;
  required?: boolean;
  value?: string;
};

export function APIItem({
  children,
  name,
  optional,
  required,
  type,
  value,
}: Item) {
  return (
    <AccordionItem className="select-text" value={value ?? name}>
      <AccordionTrigger className="group hover:no-underline">
        <li id={name} className="scroll-mt-[56px]">
          <h4 className="relative py-2 text-start font-semibold leading-none tracking-tight">
            <a
              className={cn(
                'opacity-0 hover:opacity-100 group-hover:opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
              href={`#${name}`}
            >
              <div className="absolute -left-5 top-2 pr-1 leading-none">
                <Icons.pragma className="size-4 text-muted-foreground" />
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

export function APIOptions({ children, ...props }: APIListProps) {
  return (
    <APIList type="options" {...props}>
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
  children: ReactNode;
  collapsed?: boolean;
  type?: string;
};

export function APIList({
  children,
  collapsed = false,
  type = 'parameters',
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
              {type === 'options' && 'Options'}
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
                className="w-full"
                value={values}
                onValueChange={setValues}
                type="multiple"
              >
                {React.Children.map(children, (child, i) => {
                  return React.cloneElement(child as any, {
                    className: 'pt-4',
                    value: i.toString(),
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
  children,
  name,
  optional,
  parent,
  required,
  type,
}: {
  children: ReactNode;
  name: string;
  parent: string;
  type: string;
  optional?: boolean;
  required?: boolean;
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
  children,
  open,
}: {
  children: ReactNode;
  open?: boolean;
}) {
  const [value, setValue] = useState(open ? '1' : '');

  return (
    <Card className="my-2">
      <Accordion
        className="w-full"
        defaultValue={open ? '1' : ''}
        onValueChange={setValue}
        type="single"
        collapsible
      >
        <AccordionItem className="border-none" value="1">
          <AccordionTrigger className="group px-3" iconVariant="plus">
            {value ? 'Hide' : 'Show'} child attributes
          </AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
