'use client';

import { isOrderedList, ListType } from 'platejs';
import {
  ListPlugin,
  type RenderNodeWrapper,
  useEditor,
  useEditorReadOnly,
} from 'platejs/react';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const config: Record<
  string,
  {
    Li: React.FC<ListWrapperProps>;
    Marker: React.FC<ListWrapperProps>;
  }
> = {
  task: {
    Li: TodoLi,
    Marker: TodoMarker,
  },
};

type ListWrapper = RenderNodeWrapper<typeof ListPlugin>;
type ListWrapperProps = Parameters<ListWrapper>[0] & {
  lineBreakBadge?: React.ReactNode;
  listStart?: number;
  listStyle?: string;
  listType: ListType;
};

export const BlockList: ListWrapper = (props) => {
  const { listStyle, listType } = props.element;

  if (!listType || listType === ListType.Bulleted) return undefined;

  return function BlockListWrapper(innerProps) {
    return (
      <List
        {...innerProps}
        listStart={innerProps.editor
          .plugin(ListPlugin)
          .read.ordinal(innerProps.element)}
        listStyle={listStyle}
        listType={listType}
      />
    );
  };
};

function List(props: ListWrapperProps) {
  const { listStart, listStyle, listType } = props;
  const { Li, Marker } = config[listType] ?? {};
  const InnerList = isOrderedList(props.element) ? 'ol' : 'ul';
  const markerStyle =
    listStyle ?? (listType === ListType.Numbered ? 'decimal' : 'none');

  return (
    <InnerList
      className="relative m-0 p-0"
      style={{ listStyleType: markerStyle }}
      start={listType === ListType.Numbered ? listStart : undefined}
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
    </InnerList>
  );
}

function TodoMarker(props: ListWrapperProps) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();

  return (
    <div contentEditable={false}>
      <Checkbox
        className={cn(
          '-left-6 absolute top-1',
          readOnly && 'pointer-events-none'
        )}
        checked={props.element.checked === true}
        onCheckedChange={(value) => {
          if (readOnly) return;

          editor.update.nodes.set({ checked: value }, { at: props.element });
        }}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
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
