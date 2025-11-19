'use client';

import React, { type ReactNode, createContext, useState } from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from 'fumadocs-ui/utils/cn';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';

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

const listTypeToId: Record<string, string> = {
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
      <Card className="mt-6 mb-16 bg-white p-0 dark:bg-zinc-800">
        <CardContent className="space-y-6 py-6 **:[p]:m-0">
          {children}
        </CardContent>
      </Card>
    </APIContext.Provider>
  );
}

export function APIItem({ children, name, optional, required, type }: Item) {
  const { listType, name: contextName } = React.useContext(APIContext);

  const id = contextName
    ? `${contextName}-${listType ? `${listTypeToId[listType]}-` : ''}${name}`
        .toLowerCase()
        .replace(/[^\da-z]+/g, '-')
        .replace(/^-|-$/g, '')
    : undefined;

  return (
    <div className="select-text border-none">
      <div className="group p-0 hover:no-underline">
        <li id={id} className="scroll-mt-20">
          <h4 className="!my-0 relative py-2 text-start font-semibold leading-none tracking-tight">
            {id && (
              <a
                className={cn(
                  'opacity-0 hover:opacity-100 group-hover:opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
                href={`#${id}`}
              >
                <div className="-left-5 absolute top-2 pr-1 leading-none">
                  <LinkIcon className="size-4 text-muted-foreground" />
                </div>
              </a>
            )}
            <span className="font-mono font-semibold text-sm leading-none group-hover:underline">
              {name}
            </span>
            {required && (
              <span className="font-mono text-orange-500 text-xs leading-none">
                {' '}
                REQUIRED
              </span>
            )}
            <span className="text-left font-medium font-mono text-muted-foreground text-sm leading-none">
              {!required && optional && ' optional'} {type}
            </span>
          </h4>
        </li>
      </div>
      <div className="pt-2 pb-0">{children}</div>
    </div>
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
  listType = 'parameters',
  type,
}: APIListProps) {
  const { name } = React.useContext(APIContext);
  const childCount = React.Children.count(children);

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
                className="group !my-0 relative scroll-mt-20 font-medium text-lg leading-none tracking-tight"
              >
                {id && (
                  <a
                    className={cn(
                      'opacity-0 hover:opacity-100 group-hover:opacity-100'
                    )}
                    onClick={(e) => e.stopPropagation()}
                    href={`#${id}`}
                  >
                    <div className="-left-5 absolute top-0 pr-1 leading-none">
                      <LinkIcon className="size-4 text-muted-foreground" />
                    </div>
                  </a>
                )}

                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 font-medium text-base',
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
                  <span className="ml-2 font-medium font-mono text-muted-foreground text-sm">
                    {type}
                  </span>
                )}
              </h3>
            </div>

            <ul className="!m-0 list-none p-0">
              {/* {listType !== 'returns' && <Separator />} */}
              <Separator />

              <div className="w-full space-y-2 py-4">
                {childCount > 0 ? (
                  children
                ) : (
                  <div className="py-4 text-muted-foreground text-sm">
                    No parameters.
                  </div>
                )}
              </div>
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
    ? `${contextName}-${
        listType ? `${listTypeToId[listType]}-` : ''
      }${parent}-${name}`
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
              'opacity-0 hover:opacity-100 group-hover:opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
            href={`#${id}`}
          >
            <div className="-left-5 absolute top-2 pr-1 leading-none">
              <LinkIcon className="size-4 text-muted-foreground" />
            </div>
          </a>
        )}
        <span className="font-semibold text-muted-foreground leading-none">
          {parent}.
        </span>
        <span className="font-semibold leading-none">{name}</span>
        {required && (
          <span className="ml-1 font-mono text-orange-500 text-xs leading-none">
            {' '}
            REQUIRED
          </span>
        )}
        <span className="text-left font-medium font-mono text-muted-foreground text-sm leading-none group-hover:no-underline">
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
    <Card className="my-2 p-0">
      <Accordion
        className="w-full py-0"
        defaultValue={open ? '1' : ''}
        onValueChange={setValue}
        type="single"
        collapsible
      >
        <AccordionItem className="border-none" value="1">
          <AccordionTrigger className="group px-3 py-2" iconVariant="plus">
            {value ? 'Hide' : 'Show'} child attributes
          </AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-label="Link to section"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Link to section</title>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function Separator({
  className,
  decorative = true,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px',
        className
      )}
      data-slot="separator-root"
      decorative={decorative}
      {...props}
    />
  );
}

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-b **:my-0 last:border-b-0', className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

function AccordionTrigger({
  children,
  className,
  iconVariant = 'chevron',
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  iconVariant?: 'chevron' | 'plus';
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all **:my-0 hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {iconVariant === 'plus' && (
          <PlusIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
        )}
        {children}
        {iconVariant === 'chevron' && (
          <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      data-slot="accordion-content"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

export const Steps = ({ ...props }) => (
  <div
    className={cn(
      'mb-12 ml-4 border-l pl-8 [counter-reset:step]',
      '*:[h3,h4]:[counter-increment:step]',
      '*:[h3,h4]:first-child:mt-0',
      '*:[h3,h4]:mt-8',
      '*:[h3,h4]:mb-4',
      '*:[h3,h4]:text-base',
      '*:[h3,h4]:font-semibold',
      '*:[h3,h4]:before:absolute',
      '*:[h3,h4]:before:inline-flex',
      '*:[h3,h4]:before:h-9',
      '*:[h3,h4]:before:w-9',
      '*:[h3,h4]:before:items-center',
      '*:[h3,h4]:before:justify-center',
      '*:[h3,h4]:before:rounded-full',
      '*:[h3,h4]:before:border-4',
      '*:[h3,h4]:before:border-background',
      '*:[h3,h4]:before:bg-muted',
      '*:[h3,h4]:before:text-center',
      '*:[h3,h4]:before:-indent-px',
      '*:[h3,h4]:before:font-mono',
      '*:[h3,h4]:before:text-base',
      '*:[h3,h4]:before:font-medium',
      '*:[h3,h4]:before:mt-[-4px]',
      '*:[h3,h4]:before:ml-[-50px]',
      '*:[h3,h4]:before:[content:counter(step)]'
    )}
    {...props}
  />
);

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      className="relative w-full overflow-x-auto"
      data-slot="table-container"
    >
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        data-slot="table"
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn('[&_tr]:border-b', className)}
      data-slot="table-header"
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0', className)}
      data-slot="table-body"
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn(
        'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
        className
      )}
      data-slot="table-footer"
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      data-slot="table-row"
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn(
        'whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      data-slot="table-cell"
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      className={cn('mt-4 text-muted-foreground text-sm', className)}
      data-slot="table-caption"
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};

const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current',
      },
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className
      )}
      data-slot="alert-title"
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-muted-foreground text-sm [&_p]:leading-relaxed',
        className
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className
      )}
      data-slot="card"
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      data-slot="card-header"
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('font-semibold leading-none', className)}
      data-slot="card-title"
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-muted-foreground text-sm', className)}
      data-slot="card-description"
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      data-slot="card-action"
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-6', className)}
      data-slot="card-content"
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};

export const KeyTable = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Table>) => (
  <Table className={cn('my-4', className)} {...props}>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Key</TableHead>
        <TableHead>Description</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>{children}</TableBody>
  </Table>
);

export const KeyTableItem = ({
  children,
  hotkey,
}: {
  children: React.ReactNode;
  hotkey: string;
}) => (
  <TableRow>
    <TableCell>
      <kbd className="inline-flex min-w-[8px] items-center justify-center whitespace-nowrap rounded bg-muted px-2 shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(248,_249,_250)_0px_1px_5px_0px_inset,_rgb(193,_200,_205)_0px_0px_0px_0.5px,_rgb(193,_200,_205)_0px_2px_1px_-1px,_rgb(193,_200,_205)_0px_1px_0px_0px] dark:shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(26,_29,_30)_0px_1px_5px_0px_inset,_rgb(76,_81,_85)_0px_0px_0px_0.5px,_rgb(76,_81,_85)_0px_2px_1px_-1px,_rgb(76,_81,_85)_0px_1px_0px_0px]">
        {hotkey}
      </kbd>
    </TableCell>
    <TableCell>{children}</TableCell>
  </TableRow>
);

export const EmptyComponent = ({
  children,
}: {
  children?: React.ReactNode;
}) => <>{children}</>;
