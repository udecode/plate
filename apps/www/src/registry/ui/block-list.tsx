'use client';

import React from 'react';

import { isOrderedList } from '@platejs/list';
import {
  type ListPlugin,
  useTodoListElement,
  useTodoListElementState,
} from '@platejs/list/react';
import { type RenderNodeWrapper, useEditorReadOnly } from 'platejs/react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const config: Record<
  string,
  {
    Li: React.FC<ListWrapperProps>;
    Marker: React.FC<ListWrapperProps>;
  }
> = {
  todo: {
    Li: TodoLi,
    Marker: TodoMarker,
  },
};

type ListWrapper = RenderNodeWrapper<typeof ListPlugin>;
type ListWrapperProps = Parameters<ListWrapper>[0] & {
  lineBreakBadge?: React.ReactNode;
  listStart?: number;
  listStyleType: string;
};

export const BlockList: ListWrapper = (props) => {
  const { listStart, listStyleType } = props.element;

  if (!listStyleType) return;
  if (!isOrderedList(props.element)) return;

  return (props) => (
    <List {...props} listStart={listStart} listStyleType={listStyleType} />
  );
};

function List(props: ListWrapperProps) {
  const { listStart, listStyleType } = props;
  const { Li, Marker } = config[listStyleType] ?? {};
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  return (
    <List
      className="relative m-0 p-0"
      style={{ listStyleType }}
      start={listStart}
    >
      {Marker && <Marker {...props} />}
      {Li ? (
        <Li {...props} />
      ) : (
        <li>
          {props.children}
          {props.lineBreakBadge}
        </li>
      )}
    </List>
  );
}

function TodoMarker(props: ListWrapperProps) {
  const state = useTodoListElementState({ element: props.element });
  const { checkboxProps } = useTodoListElement(state);
  const readOnly = useEditorReadOnly();

  return (
    <div contentEditable={false}>
      <Checkbox
        className={cn(
          '-left-6 absolute top-1',
          readOnly && 'pointer-events-none'
        )}
        {...checkboxProps}
      />
    </div>
  );
}

function TodoLi(props: ListWrapperProps) {
  return (
    <li
      className={cn(
        'list-none',
        props.element.checked === true && 'text-muted-foreground line-through'
      )}
    >
      {props.children}
      {props.lineBreakBadge}
    </li>
  );
}
