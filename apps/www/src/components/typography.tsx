import * as React from 'react';

import type { Event } from '@/lib/events';
import type { Style } from '@/registry/styles';
import type { NpmCommands } from '@/types/unist';

import { cn } from '@udecode/cn';

import { CopyButton, CopyNpmCommandButton } from './copy-button';
import { StyleWrapper } from './style-wrapper';

export const H1 = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn(
      'mt-2 scroll-m-20 font-heading text-4xl font-bold',
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
      'mt-12 scroll-m-20 pb-2 font-heading text-2xl font-semibold tracking-tight first:mt-0',
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
      'mt-8 scroll-m-20 font-heading text-xl font-semibold tracking-tight',
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
      'mt-8 scroll-m-20 font-heading text-lg font-semibold tracking-tight',
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
      'mt-8 scroll-m-20 text-lg font-semibold tracking-tight',
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
      'mt-8 scroll-m-20 text-base font-semibold tracking-tight',
      className
    )}
    {...props}
  />
);

export const A = ({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    className={cn('font-medium underline underline-offset-4', className)}
    {...props}
  />
);

export const P = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
    {...props}
  />
);

export const UL = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn('my-4 ml-6 list-disc', className)} {...props} />
);

export const OL = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLOListElement>) => (
  <ol className={cn('my-4 ml-6 list-decimal', className)} {...props} />
);

export const LI = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => (
  <li className={cn('mt-2', className)} {...props} />
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
  // eslint-disable-next-line @next/next/no-img-element
  <img alt={alt} className={cn('rounded-md', className)} {...props} />
);

export const HR = ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className="my-4 md:my-8" {...props} />
);

export const Table = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="my-6 w-full overflow-y-auto rounded-lg">
    <table
      className={cn('w-full overflow-hidden rounded-lg', className)}
      {...props}
    />
  </div>
);

export const TR = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('m-0 border-t p-0', className)} {...props} />
);

export const TH = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
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
      'border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
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
  __style__,
  __withMeta__,
  __yarnCommand__,
  className,
  ...props
}: {
  __event__?: Event['name'];
  __rawString__?: string;
  __src__?: string;
  __style__?: Style['name'];
  __withMeta__?: boolean;
} & NpmCommands &
  React.HTMLAttributes<HTMLPreElement>) => {
  return (
    <StyleWrapper styleName={__style__}>
      <pre
        className={cn(
          'mb-4 mt-6 max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 py-4 dark:bg-zinc-900',
          className
        )}
        {...props}
      />
      {__rawString__ && !__npmCommand__ && (
        <CopyButton
          className={cn('absolute right-4 top-4', __withMeta__ && 'top-16')}
          event={__event__}
          src={__src__}
          value={__rawString__}
        />
      )}
      {__npmCommand__ &&
        __yarnCommand__ &&
        __pnpmCommand__ &&
        __bunCommand__ && (
          <CopyNpmCommandButton
            className={cn('absolute right-4 top-4', __withMeta__ && 'top-16')}
            commands={{
              __bunCommand__,
              __npmCommand__,
              __pnpmCommand__,
              __yarnCommand__,
            }}
          />
        )}
    </StyleWrapper>
  );
};

export const Step = ({ className, ...props }: React.ComponentProps<'h3'>) => (
  <h3
    className={cn(
      'mt-8 scroll-m-20 font-heading text-xl font-semibold tracking-tight',
      className
    )}
    {...props}
  />
);

export const Steps = ({ ...props }) => (
  <div
    // eslint-disable-next-line tailwindcss/no-custom-classname
    className="[&>h3]:step steps mb-12 ml-4 border-l pl-8 [counter-reset:step]"
    {...props}
  />
);
