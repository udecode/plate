import { BaseListPlugin, isOrderedList, ListType } from '@platejs/list';
import { CheckIcon } from 'lucide-react';
import type { RenderStaticNodeWrapper } from 'platejs';
import * as React from 'react';

import { cn } from '@/lib/utils';

type ListWrapper = RenderStaticNodeWrapper<typeof BaseListPlugin>;
type BlockListProps = Parameters<NonNullable<ReturnType<ListWrapper>>>[0] & {
  indent?: number;
  listStart?: number;
  listStyle?: string;
  listType: ListType;
};

const config: Record<
  string,
  {
    Li: React.FC<BlockListProps>;
    Marker: React.FC<BlockListProps>;
  }
> = {
  task: {
    Li: TodoLiStatic,
    Marker: TodoMarkerStatic,
  },
};

export const BlockListStatic: ListWrapper = (props) => {
  const { indent, listStyle, listType } = props.element;

  if (!listType || listType === ListType.Bulleted) return undefined;

  return function BlockListStaticWrapper(innerProps) {
    return (
      <List
        {...innerProps}
        indent={typeof indent === 'number' ? indent : undefined}
        listStart={innerProps.editor
          .plugin(BaseListPlugin)
          .read.ordinal(innerProps.element)}
        listStyle={listStyle}
        listType={listType}
      />
    );
  };
};

function List(props: BlockListProps) {
  const { indent, listStart, listStyle, listType } = props;
  const { Li, Marker } = config[listType] ?? {};
  const InnerList = isOrderedList(props.element) ? 'ol' : 'ul';
  const markerStyle =
    listStyle ?? (listType === ListType.Numbered ? 'decimal' : 'none');

  // Apply margin-left for indent (24px per level) for DOCX export compatibility
  const marginLeft = indent ? `${indent * 24}px` : undefined;

  return (
    <InnerList
      className="relative m-0 p-0"
      style={{ listStyleType: markerStyle, marginLeft }}
      start={listType === ListType.Numbered ? listStart : undefined}
    >
      {Marker && <Marker {...props} />}
      {Li ? <Li {...props} /> : <li>{props.children}</li>}
    </InnerList>
  );
}

function TodoMarkerStatic(props: BlockListProps) {
  const checked = props.element.checked === true;

  return (
    <div contentEditable={false}>
      <button
        className={cn(
          'peer -left-6 pointer-events-none absolute top-1 size-4 shrink-0 rounded-sm border border-primary bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
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

function TodoLiStatic(props: BlockListProps) {
  return (
    <li
      className={cn(
        'list-none',
        props.element.checked === true && 'text-muted-foreground line-through'
      )}
    >
      {props.children}
    </li>
  );
}
