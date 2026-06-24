import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeftRight,
  Bold,
  CircleHelp,
  Code,
  Copy,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  type LucideIcon,
  MousePointerClick,
  Plus,
  Quote,
  RemoveFormatting,
  Search,
  Trash2,
  Underline,
  Unlink,
} from 'lucide-react';
import type React from 'react';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';

import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type ButtonProps = React.ComponentProps<typeof ShadcnButton> & {
  active?: boolean;
  reversed?: boolean;
};

type IconProps = Omit<React.ComponentPropsWithRef<'svg'>, 'children'> & {
  children?: ReactNode;
};

type DivProps = React.ComponentPropsWithRef<'div'>;

const iconComponents: Record<string, LucideIcon> = {
  add: Plus,
  code: Code,
  content_copy: Copy,
  delete: Trash2,
  format_align_center: AlignCenter,
  format_align_justify: AlignJustify,
  format_align_left: AlignLeft,
  format_align_right: AlignRight,
  format_bold: Bold,
  format_clear: RemoveFormatting,
  format_italic: Italic,
  format_list_bulleted: List,
  format_list_numbered: ListOrdered,
  format_quote: Quote,
  format_underlined: Underline,
  image: ImageIcon,
  link: LinkIcon,
  link_off: Unlink,
  looks_one: Heading1,
  looks_two: Heading2,
  search: Search,
  smart_button: MousePointerClick,
  sync_alt: ArrowLeftRight,
};

const iconLabels: Record<string, string> = {
  add: 'Add',
  code: 'Code',
  content_copy: 'Copy',
  delete: 'Delete',
  format_align_center: 'Align center',
  format_align_justify: 'Justify',
  format_align_left: 'Align left',
  format_align_right: 'Align right',
  format_bold: 'Bold',
  format_clear: 'Clear formatting',
  format_italic: 'Italic',
  format_list_bulleted: 'Bulleted list',
  format_list_numbered: 'Numbered list',
  format_quote: 'Quote',
  format_underlined: 'Underline',
  image: 'Image',
  link: 'Link',
  link_off: 'Unlink',
  looks_one: 'Heading one',
  looks_two: 'Heading two',
  search: 'Search',
  smart_button: 'Button',
  sync_alt: 'Sync',
};

export const Button = ({
  className,
  active,
  reversed,
  ref,
  size = 'icon',
  variant,
  ...props
}: ButtonProps) => (
  <ShadcnButton
    {...props}
    className={cn(
      'plite-example-button',
      active && 'is-active',
      reversed && 'is-reversed',
      className
    )}
    ref={ref}
    size={size}
    variant={variant ?? (active ? 'secondary' : 'ghost')}
  />
);

export const Icon = ({ children, className, ref, ...props }: IconProps) => {
  const iconName = typeof children === 'string' ? children : '';
  const IconComponent = iconComponents[iconName] ?? CircleHelp;
  const label = iconLabels[iconName] ?? iconName;

  return (
    <>
      <IconComponent
        {...props}
        aria-hidden
        className={cn('size-4', className)}
        ref={ref}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
};

export const Instruction = ({ className, ref, ...props }: DivProps) => (
  <div
    {...props}
    className={cn('plite-example-instruction', className)}
    ref={ref}
  />
);

export const Menu = ({ className, ref, ...props }: DivProps) => (
  <div
    {...props}
    className={cn('plite-example-menu', className)}
    data-test-id="menu"
    ref={ref}
  />
);

export const Portal = ({ children }: { children?: ReactNode }) =>
  typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null;

export const Toolbar = ({ className, ref, ...props }: DivProps) => (
  <Menu
    {...props}
    className={cn('plite-example-toolbar', className)}
    ref={ref}
  />
);
