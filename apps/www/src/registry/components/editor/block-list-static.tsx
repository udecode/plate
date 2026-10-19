import { CheckIcon } from 'lucide-react';
import {
  BaseListPlugin,
  type Editor,
  type Element,
  isOrderedList,
  ListType,
  type RenderStaticNodeWrapper,
} from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseImagePlugin } from 'platejs/media';
import * as React from 'react';

import { cn } from '@/lib/utils';

type ListWrapper = RenderStaticNodeWrapper<typeof BaseListPlugin>;

// Toggles and images draw no wrapped children, so their bullets keep the
// marker on the block itself.
export const drawsBulletOnRoot = (editor: Editor, element: Element) =>
  element.listType === ListType.Bulleted &&
  !isOrderedList(element) &&
  [BaseDetailsPlugin, BaseImagePlugin].some((descriptor) => {
    const plugin = editor.plugin(descriptor);

    return plugin.installed && element.type === plugin.schema.type;
  });

export const BlockListStatic: ListWrapper = (props) => {
  const { listStyle, listType } = props.element;

  if (!listType || drawsBulletOnRoot(props.editor, props.element)) {
    return undefined;
  }

  return function BlockListStaticWrapper(innerProps) {
    return (
      <List
        {...innerProps}
        listStart={
          listType === ListType.Numbered
            ? innerProps.editor
                .plugin(BaseListPlugin)
                .read.ordinal(innerProps.path)
            : undefined
        }
        listStyle={listStyle}
        listType={listType}
      />
    );
  };
};

function List(
  props: Parameters<NonNullable<ReturnType<ListWrapper>>>[0] & {
    listStart?: number;
    listStyle?: string;
    listType: ListType;
  }
) {
  const { listStart, listStyle, listType } = props;
  const isTask = listType === ListType.Task;
  const isBullet = listType === ListType.Bulleted;
  const InnerList = isOrderedList(props.element) ? 'ol' : 'ul';
  const markerStyle =
    listStyle ??
    (listType === ListType.Numbered ? 'decimal' : isBullet ? 'disc' : 'none');

  return (
    <InnerList
      className="relative m-0 p-0"
      data-list-id={props.element.listId ?? ''}
      data-list-levels={
        props.element.listLevels
          ? JSON.stringify(props.element.listLevels)
          : undefined
      }
      style={{ listStyleType: markerStyle }}
      start={listType === ListType.Numbered ? listStart : undefined}
    >
      <li
        data-checked={
          isTask ? String(props.element.checked === true) : undefined
        }
        data-indent={props.element.indent}
        data-list-id={props.element.listId ?? ''}
        data-list-levels={
          props.element.listLevels
            ? JSON.stringify(props.element.listLevels)
            : undefined
        }
        data-list-restart={props.element.listRestart}
        data-list-start={props.element.listStart}
        data-list-style={isBullet ? listStyle : undefined}
        data-list-type={listType}
        className={
          isTask
            ? cn(
                'list-none',
                props.element.checked === true &&
                  'text-muted-foreground line-through'
              )
            : undefined
        }
      >
        {isTask && <TodoMarkerStatic {...props} />}
        {props.children}
      </li>
    </InnerList>
  );
}

function TodoMarkerStatic(
  props: Parameters<NonNullable<ReturnType<ListWrapper>>>[0] & {
    listStart?: number;
    listStyle?: string;
    listType: ListType;
  }
) {
  const checked = props.element.checked === true;

  return (
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
  );
}
