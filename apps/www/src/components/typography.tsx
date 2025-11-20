import * as React from 'react';

import type { Event } from '@/lib/events';
import type { NpmCommands } from '@/types/unist';

import { CodeBlockCommand } from '@/components/code-block-command';
import { cn } from '@/lib/utils';

import { CopyButton } from './copy-button';

export const H1 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn(
      'group mt-2 scroll-m-20 font-bold font-heading text-4xl',
      className
    )}
    {...props}
  />
);

export const H2 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      'group mt-12 scroll-m-20 border-b pb-2 font-heading font-semibold text-2xl tracking-tight first:mt-0',
      className
    )}
    {...props}
  />
);

export const H3 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      'group mt-8 scroll-m-20 font-heading font-semibold text-xl tracking-tight',
      className
    )}
    {...props}
  />
);

export const H4 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4
    className={cn(
      'group mt-8 scroll-m-20 font-heading font-semibold text-lg tracking-tight',
      className
    )}
    {...props}
  />
);

export const H5 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5
    className={cn(
      'group mt-8 scroll-m-20 font-semibold text-lg tracking-tight',
      className
    )}
    {...props}
  />
);

export const H6 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h6
    className={cn(
      'group mt-8 scroll-m-20 font-semibold text-base tracking-tight',
      className
    )}
    {...props}
  />
);

export const P = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('not-first:mt-6 leading-7 [&_code]:text-sm', className)}
    {...props}
  />
);

export const UL = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    className={cn(
      'group not-prose !ml-6 first:!mt-0 my-4 list-disc group-data-list:my-2',
      className
    )}
    data-list
    {...props}
  />
);

export const OL = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={cn(
      'group first:!mt-0 my-4 ml-6 list-decimal group-data-list:my-2',
      className
    )}
    data-list
    {...props}
  />
);

export const LI = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => (
  <li className={cn('mt-2 mb-0 *:[ul]:my-0', className)} {...props} />
);

export const Blockquote = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => (
  <blockquote
    className={cn('mt-6 border-l-2 pl-6 italic', className)}
    {...props}
  />
);

export const Image = ({
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img className={cn('rounded-md', className)} alt={alt} {...props} />
);

export const HR = ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className="my-4 md:my-8" {...props} />
);

export const Table = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="my-6 w-full overflow-y-auto">
    <table
      className={cn(
        'relative w-full overflow-hidden border-none text-sm',
        className
      )}
      {...props}
    />
  </div>
);

export const TR = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
);

export const TH = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
      className
    )}
    {...props}
  />
);

export const TD = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn(
      'px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
      className
    )}
    {...props}
  />
);

export const Pre = ({
  __bunCommand__,
  __event__,
  __npmCommand__,
  __pnpmCommand__,
  __rawString__,
  __src__,
  __withMeta__,
  __yarnCommand__,
  className,
  ...props
}: {
  __event__?: Event['name'];
  __rawString__?: string;
  __src__?: string;
  __withMeta__?: boolean;
} & NpmCommands &
  React.HTMLAttributes<HTMLPreElement>) => {
  const isNpmCommand =
    __npmCommand__ && __yarnCommand__ && __pnpmCommand__ && __bunCommand__;
  if (isNpmCommand) {
    return (
      <CodeBlockCommand
        __bunCommand__={__bunCommand__}
        __npmCommand__={__npmCommand__}
        __pnpmCommand__={__pnpmCommand__}
        __yarnCommand__={__yarnCommand__}
      />
    );
  }

  return (
    <pre
      className={cn(
        'relative mt-6 mb-4 max-h-[650px] overflow-x-auto rounded-xl bg-zinc-950 py-4 text-white dark:bg-zinc-900 *:[code]:bg-inherit',
        className
      )}
      {...props}
    >
      {props.children}

      {__rawString__ && (
        <CopyButton
          variant="default"
          className={cn('absolute top-4 right-4')}
          value={__rawString__}
          event={__event__}
          src={__src__}
        />
      )}
    </pre>
  );
};

export const Step = ({ className, ...props }: React.ComponentProps<'h3'>) => (
  <h3
    className={cn(
      'mt-8 scroll-m-20 font-heading font-semibold text-xl tracking-tight',
      'before:-indent-px mt-8 mb-4 font-semibold text-base [counter-increment:step] before:absolute before:mt-[-4px] before:ml-[-50px] before:inline-flex before:h-9 before:w-9 before:items-center before:justify-center before:rounded-full before:border-4 before:border-background before:bg-muted before:text-center before:font-medium before:font-mono before:text-base first-child:mt-0 before:[content:counter(step)]',
      className
    )}
    {...props}
  />
);

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
