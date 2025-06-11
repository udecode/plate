import type { HTMLAttributes, ReactNode } from 'react';

import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  HighlighterIcon,
  ItalicIcon,
  KeyboardIcon,
  MinusIcon,
  QuoteIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  UnderlineIcon,
} from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

// Icon registry for Card components
const iconRegistry = {
  blockquote: QuoteIcon,
  bold: BoldIcon,
  code: CodeIcon,
  'code-block': CodeIcon,
  heading: Heading1Icon,
  highlight: HighlighterIcon,
  'horizontal-rule': MinusIcon,
  italic: ItalicIcon,
  kbd: KeyboardIcon,
  strikethrough: StrikethroughIcon,
  subscript: SubscriptIcon,
  superscript: SuperscriptIcon,
  underline: UnderlineIcon,
};

export function Cards(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        '@container grid grid-cols-2 gap-4 not-first:mt-4',
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export type CardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode;
  description?: ReactNode;
  external?: boolean;
  href?: string;
  icon?: ReactNode | string;
};

export function Card({ description, icon, title, ...props }: CardProps) {
  const E = props.href ? (Link as any) : 'div';

  // Resolve icon if it's a string
  let IconComponent = null;
  if (typeof icon === 'string') {
    const IconClass = iconRegistry[icon as keyof typeof iconRegistry];
    IconComponent = IconClass ? <IconClass /> : null;
  } else if (icon) {
    IconComponent = icon;
  }

  return (
    <E
      {...props}
      className={cn(
        'block rounded-lg border bg-card p-4 text-card-foreground shadow-md transition-colors @max-lg:col-span-full',
        props.href && 'hover:bg-accent/80',
        props.className
      )}
      data-card
    >
      {IconComponent ? (
        <div className="mb-2 w-fit rounded-md border bg-muted p-1.5 text-muted-foreground [&_svg]:size-4">
          {IconComponent}
        </div>
      ) : null}
      <h3 className="mb-1 text-sm font-medium">{title}</h3>
      {description ? (
        <p className="!my-0 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {props.children ? (
        <div className="text-sm text-muted-foreground **:leading-normal">
          {props.children}
        </div>
      ) : null}
    </E>
  );
}
