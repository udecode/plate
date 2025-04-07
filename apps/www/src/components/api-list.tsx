'use client';

import React, { type ReactNode, createContext, useState } from 'react';

import { cn } from '@udecode/cn';

import { Separator } from '@/registry/default/plate-ui/separator';

import { Icons } from './icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Card, CardContent } from './ui/card';

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

const APIContext = createContext<{ listType?: string; name?: string }>({});

const listTypeToId: any = {
  api: 'api',
  attributes: 'attrs',
  methods: 'methods',
  options: 'opt',
  parameters: 'params',
  props: 'props',
  returns: 'returns',
  state: 'state',
  transforms: 'tf',
};

const listTypeToBadgeStyles: Record<string, string> = {
  api: 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  attributes: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  methods: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  options: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  parameters: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  props: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  returns: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  state: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  transforms:
    'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
};

export function API({ children, name }: { children: ReactNode; name: string }) {
  return (
    <APIContext.Provider value={{ name }}>
      <Card className="mt-6 mb-16">
        <CardContent className="space-y-6 py-6">{children}</CardContent>
      </Card>
    </APIContext.Provider>
  );
}

export function APIItem({
  children,
  name,
  optional,
  required,
  type,
  value,
}: Item) {
  const { listType, name: contextName } = React.useContext(APIContext);

  const id = contextName
    ? `${contextName}-${listType ? `${listTypeToId[listType]}-` : ''}${name}`
        .toLowerCase()
        .replace(/[^\da-z]+/g, '-')
        .replace(/^-|-$/g, '')
    : undefined;

  return (
    <AccordionItem className="border-none select-text" value={value ?? name}>
      <AccordionTrigger className="group p-0 hover:no-underline">
        <li id={id} className="scroll-mt-20">
          <h4 className="relative py-2 text-start leading-none font-semibold tracking-tight">
            {id && (
              <a
                className={cn(
                  'opacity-0 group-hover:opacity-100 hover:opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
                href={`#${id}`}
              >
                <div className="absolute top-2 -left-5 pr-1 leading-none">
                  <Icons.pragma className="size-4 text-muted-foreground" />
                </div>
              </a>
            )}
            <span className="font-mono text-sm leading-none font-semibold group-hover:underline">
              {name}
            </span>
            {required && (
              <span className="font-mono text-xs leading-none text-orange-500">
                {' '}
                REQUIRED
              </span>
            )}
            <span className="text-left font-mono text-sm leading-none font-medium text-muted-foreground">
              {!required && optional && ' optional'} {type}
            </span>
          </h4>
        </li>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-0">{children}</AccordionContent>
    </AccordionItem>
  );
}

export function APIAttributes({ children, ...props }: APIListProps) {
  return (
    <APIList listType="attributes" {...props}>
      {children}
    </APIList>
  );
}

export function APIOptions({ children, ...props }: APIListProps) {
  return (
    <APIList listType="options" {...props}>
      {children}
    </APIList>
  );
}

export function APIProps({ children, ...props }: APIListProps) {
  return (
    <APIList listType="props" {...props}>
      {children}
    </APIList>
  );
}

export function APIState({ children, ...props }: APIListProps) {
  return (
    <APIList listType="state" {...props}>
      {children}
    </APIList>
  );
}

export function APIReturns({ children, ...props }: APIListProps) {
  return (
    <APIList listType="returns" {...props}>
      {children}
    </APIList>
  );
}

export function APIParameters({ children, ...props }: APIListProps) {
  return (
    <APIList listType="parameters" {...props}>
      {children}
    </APIList>
  );
}

export function APIListAPI({ children, ...props }: APIListProps) {
  return (
    <APIList listType="api" {...props}>
      {children}
    </APIList>
  );
}

export function APITransforms({ children, ...props }: APIListProps) {
  return (
    <APIList listType="transforms" {...props}>
      {children}
    </APIList>
  );
}

export function APIMethods({ children, ...props }: APIListProps) {
  return (
    <APIList listType="methods" {...props}>
      {children}
    </APIList>
  );
}

type APIListProps = {
  children: ReactNode;
  collapsed?: boolean;
  listType?: string;
  type?: string;
};

export function APIList({
  children,
  collapsed = false,
  listType = 'parameters',
  type,
}: APIListProps) {
  const { name } = React.useContext(APIContext);
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

  if (listType === 'returns' && !childCount) return null;

  const id = name ? `${name}-${listTypeToId[listType]}` : undefined;

  return (
    <APIContext.Provider value={{ listType, name }}>
      <section className="flex w-full flex-col items-center">
        <div className="w-full">
          <div className="">
            <div className="flex items-center justify-between pb-4">
              <h3
                id={id}
                className="group relative scroll-mt-20 text-lg leading-none font-medium tracking-tight"
              >
                {id && (
                  <a
                    className={cn(
                      'opacity-0 group-hover:opacity-100 hover:opacity-100'
                    )}
                    onClick={(e) => e.stopPropagation()}
                    href={`#${id}`}
                  >
                    <div className="absolute top-0 -left-5 pr-1 leading-none">
                      <Icons.pragma className="size-4 text-muted-foreground" />
                    </div>
                  </a>
                )}

                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-base font-medium',
                    'ring-1 ring-black/5 ring-inset dark:ring-white/5',
                    listTypeToBadgeStyles[listType]
                  )}
                >
                  {listType === 'parameters' && 'Parameters'}
                  {listType === 'attributes' && 'Attributes'}
                  {listType === 'returns' && 'Returns'}
                  {listType === 'props' && 'Props'}
                  {listType === 'state' && 'State'}
                  {listType === 'options' && 'Options'}
                  {listType === 'api' && 'API'}
                  {listType === 'methods' && 'Methods'}
                  {listType === 'transforms' && 'Transforms'}
                </span>

                {type && (
                  <span className="ml-2 font-mono text-sm font-medium text-muted-foreground">
                    {type}
                  </span>
                )}
              </h3>

              {hasItems && (
                <div
                  className="cursor-pointer text-sm text-muted-foreground select-none"
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
              {/* {listType !== 'returns' && <Separator />} */}
              <Separator />

              {hasItems ? (
                <Accordion
                  className="w-full space-y-2 py-4"
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
    </APIContext.Provider>
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
  const { listType, name: contextName } = React.useContext(APIContext);

  const id = contextName
    ? `${contextName}-${listType ? `${listTypeToId[listType]}-` : ''}${parent}-${name}`
        .toLowerCase()
        .replace(/[^\da-z]+/g, '-')
        .replace(/^-|-$/g, '')
    : undefined;

  return (
    <div className="border-t border-t-border p-3">
      <h4 className="relative py-2 font-mono font-semibold tracking-tight">
        {id && (
          <a
            className={cn(
              'opacity-0 group-hover:opacity-100 hover:opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
            href={`#${id}`}
          >
            <div className="absolute top-2 -left-5 pr-1 leading-none">
              <Icons.pragma className="size-4 text-muted-foreground" />
            </div>
          </a>
        )}
        <span className="leading-none font-semibold text-muted-foreground">
          {parent}.
        </span>
        <span className="leading-none font-semibold">{name}</span>
        {required && (
          <span className="ml-1 font-mono text-xs leading-none text-orange-500">
            {' '}
            REQUIRED
          </span>
        )}
        <span className="text-left font-mono text-sm leading-none font-medium text-muted-foreground group-hover:no-underline">
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
