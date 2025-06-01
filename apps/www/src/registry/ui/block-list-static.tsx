import React from 'react';

import type {
  PlateElementProps,
  RenderNodeWrapper,
} from '@udecode/plate/react';

import { type SlateRenderElementProps, KEYS } from '@udecode/plate';
import { clsx } from 'clsx';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const ULIST_STYLE_TYPES = ['circle', 'disc', 'square'] as const;

export const BlockList: RenderNodeWrapper = (props) => {
  const { element } = props;
  const listStyleType = element[KEYS.listType] as string;

  if (!listStyleType) return;

  return (props) => <ListWrapper {...props} />;
};

export function ListWrapper({ children, element }: PlateElementProps) {
  const listStyleType = element[KEYS.listType] as string;
  const listStart = element[KEYS.listStart] as number;

  let className = clsx(`slate-list-${listStyleType}`);
  const style: React.CSSProperties = {
    listStyleType,
    margin: 0,
    padding: 0,
    position: 'relative',
  };

  const isOrdered = !ULIST_STYLE_TYPES.includes(listStyleType as any);

  className = isOrdered
    ? clsx(className, 'slate-ol')
    : clsx(className, 'slate-ul');

  const List = isOrdered ? 'ol' : 'ul';

  return (
    <List className={className} style={style} start={listStart}>
      <li>{children}</li>
    </List>
  );
}

export function TodoMarkerStatic(
  props: Omit<SlateRenderElementProps, 'children'>
) {
  const checked = props.element.checked as boolean;

  return (
    <div contentEditable={false}>
      <button
        className={cn(
          'peer pointer-events-none absolute top-1 -left-6 size-4 shrink-0 rounded-sm border border-primary bg-background ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          props.className
        )}
        data-state={checked ? 'checked' : 'unchecked'}
        type="button"
      >
        <div className={cn('flex items-center justify-center text-current')}>
          {checked && <CheckIcon className="size-4" />}
        </div>
      </button>
    </div>
  );
}

export function TodoLiStatic(props: SlateRenderElementProps) {
  return (
    <li
      className={cn(
        'list-none',
        (props.element.checked as boolean) &&
          'text-muted-foreground line-through'
      )}
    >
      {props.children}
    </li>
  );
}
